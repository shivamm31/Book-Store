package com.bestdeal.bookservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/virtualstore")
public class BestDealBookController {

    public static final ScopedValue<RestCallStatistics> SCOPED_VALUE = ScopedValue.newInstance();

    @Autowired
    private BookRetrievalService retrievalService;

    @Autowired
    private RestCallStatistics timeObj;

    @Autowired
    private TraditionalBookRetrievalService traditionalBookRetrievalService;

    @GetMapping("/book")
    public BestDealResult getBestPriceForBook(@RequestParam String name, @RequestParam String model) {
        long start = System.currentTimeMillis();
        List<Book> books;
        String threadingModel = model;
        try {
            if(threadingModel.equalsIgnoreCase("virtual")) {
                books = ScopedValue.callWhere
                        (SCOPED_VALUE, timeObj, () -> retrievalService.getBookFromAllStores(name));
                System.out.println("Virtual --------------------------------------------------");
            } else {
                books = traditionalBookRetrievalService.getBookFromAllStores(name);
                System.out.println("Traditional--------------------------------------------------");
            }
                Book bestPriceBook = books.stream()
                        .min(Comparator.comparing(Book::cost))
                        .orElseThrow();

            return new BestDealResult(timeObj, bestPriceBook, books);
        } catch (Exception e) {
            throw new RuntimeException("Exception while calling getBestPrice", e);
        } finally {
            long end = System.currentTimeMillis();
            //adding directly to timeobj not using scoped value
            timeObj.addTiming("Best deal Store", end - start);
        }
    }

    @GetMapping("/traditional/book")
    public BestDealResult getBestPriceForBookTraditional(@RequestParam String name) {
        long start = System.currentTimeMillis();
        try {
            List<Book> books = traditionalBookRetrievalService.getBookFromAllStores(name);

            Book bestPriceBook = books.stream()
                    .min(Comparator.comparing(Book::cost))
                    .orElseThrow();
            return new BestDealResult(timeObj, bestPriceBook, books);
        } catch (Exception e) {
            throw new RuntimeException("Exception while calling getBestPrice", e);
        } finally {
            long end = System.currentTimeMillis();
            timeObj.addTiming("Best deal Store", end - start);
        }
    }
}
