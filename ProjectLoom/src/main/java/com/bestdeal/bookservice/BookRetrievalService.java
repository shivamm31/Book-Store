package com.bestdeal.bookservice;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.StructuredTaskScope;
import java.util.concurrent.StructuredTaskScope.Subtask;
import java.util.concurrent.StructuredTaskScope.Subtask.State;
import java.util.concurrent.ThreadFactory;

@Service
public class BookRetrievalService {

    @Value("#{${book.store.baseUrls}}")
    private Map<String, String> storeUrlMap;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Book> getBookFromAllStores(String bookName) throws InterruptedException {
        ThreadFactory factory = Thread.ofVirtual().name("book-store-thr", 0).factory();
        try (var scope = new StructuredTaskScope<Book>("virtualstore", factory)) {
            List<Subtask<Book>> bookTasks = new ArrayList<>();
            storeUrlMap.forEach((name, url) -> {
                bookTasks.add(scope.fork(() -> getBookFromStore(name, url, bookName)));
            });
            scope.join();
            bookTasks.stream()
                    .filter(t -> t.state() == State.FAILED)
                    .map(Subtask::exception)
                    .forEach(e -> e.printStackTrace());
            return bookTasks.stream()
                    .filter(t -> t.state() == State.SUCCESS)
                    .map(Subtask::get)
                    .toList();
        }
    }

    private Book getBookFromStore(String storeName, String url, String bookName) {
        long start = System.currentTimeMillis();
        List<Book> books;

        try {
            String response = restTemplate.getForObject(url, String.class);
            books = objectMapper.readValue(response, new TypeReference<List<Book>>() {});
        } catch (JsonMappingException e) {
            throw new RuntimeException(e);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        Optional<Book> bookOptional = books.stream()
                .filter(book -> book.bookName().equals(bookName))
                .findFirst();

        long end = System.currentTimeMillis();
        RestCallStatistics timeObj = BestDealBookController.SCOPED_VALUE.get();
        timeObj.addTiming(storeName, end - start);

        return bookOptional.orElse(null);
        }

}
