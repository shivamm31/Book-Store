package com.bestdeal.bookservice;

import java.util.List;

public record BestDealResult(RestCallStatistics timeStatistics, Book bestPriceDeal, List<Book> allDeals) {
}
