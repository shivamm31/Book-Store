package com.bestdeal.bookservice;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Component
public class RestCallStatistics {
    private final Map<String, Long> timeMap = Collections.synchronizedMap(new HashMap<String, Long>());

    void addTiming(String storeName, long time) {
        getTimeMap().put(storeName, time);
    }

    public Map<String, Long> getTimeMap() {
        return timeMap;
    }


}