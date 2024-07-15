package com.bestdeal.bookservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/bestdeal")
public class BestDealBookController {

    public static final ScopedValue<RestCallStatistics> SCOPED_VALUE = ScopedValue.newInstance();

    @Value("${threading.model}")
    private String threadingModel;

    @Autowired
    private BookRetrievalService retrievalService;

    @Autowired
    private RestCallStatistics timeObj;

    @Autowired
    private TraditionalBookRetrievalService traditionalBookRetrievalService;

    @GetMapping("/book")
    public BestDealResult getBestPriceForBook(@RequestParam String name) {
        long start = System.currentTimeMillis();
        List<Book> books;
        try {
            if(threadingModel.equalsIgnoreCase("virtual")) {
                books = ScopedValue.callWhere
                        (SCOPED_VALUE, timeObj, () -> retrievalService.getBookFromAllStores(name));
                System.out.println("Virtual --------------------------------------------------");
            } else {
                books = traditionalBookRetrievalService.getBookFromAllStores(name);
                System.out.println("Traditional--------------------------------------------------");
            }

            // Filter out null books
            books = books.stream()
                    .filter(book -> book != null && book.cost() != null)
                    .toList();

            if (books.isEmpty()) {
                throw new RuntimeException("No books found for the given name");
            }

            // Find the book with the minimum cost
            Book bestPriceBook = books.stream()
                    .min(Comparator.comparing(Book::cost))
                    .orElseThrow(() -> new RuntimeException("No book found with minimum cost"));

            return new BestDealResult(timeObj, bestPriceBook, books);
        } catch (Exception e) {
            throw new RuntimeException("Exception while calling getBestPrice", e);
        } finally {
            long end = System.currentTimeMillis();
            //adding directly to timeobj not using scoped value
            timeObj.addTiming("Best deal Store", end - start);
        }
    }
}
