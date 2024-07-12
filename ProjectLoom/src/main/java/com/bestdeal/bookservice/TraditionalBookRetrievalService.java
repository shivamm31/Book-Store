package com.bestdeal.bookservice;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Service
public class TraditionalBookRetrievalService {

        @Value("#{${book.store.baseUrls}}")
        private Map<String, String> storeUrlMap;

        @Autowired
        private RestCallStatistics restCallStatistics;

        private RestTemplate restTemplate = new RestTemplate();
        private final ObjectMapper objectMapper = new ObjectMapper();


        public List<Book> getBookFromAllStores(String bookName) throws InterruptedException {
            ExecutorService executorService = Executors.newFixedThreadPool(storeUrlMap.size());
            List<Book> books = new ArrayList<>();
            storeUrlMap.forEach((name, url) -> executorService.execute(() -> {
                Book book = getBookFromStore(name, url, bookName);
                synchronized (books) {
                    books.add(book);
                }
            }));
            executorService.shutdown();
            executorService.awaitTermination(Long.MAX_VALUE, TimeUnit.NANOSECONDS);
            executorService.shutdownNow();
            return books;
        }

        private Book getBookFromStore(String storeName, String url, String bookName) {
            long start = System.currentTimeMillis();
            List<Book> books;
            try {
                String response = restTemplate.getForObject(url + "/store/book", String.class);
                books = objectMapper.readValue(response, new TypeReference<List<Book>>() {
                });
            } catch (JsonMappingException e) {
                throw new RuntimeException(e);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }

            Optional<Book> bookOptional = books.stream()
                    .filter(book -> book.bookName().equals(bookName))
                    .findFirst();

            long end = System.currentTimeMillis();
            restCallStatistics.addTiming(storeName, end - start);

            return bookOptional.orElse(null);
        }
}
