package com.bestdeal.bookservice;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Component
public class RestCallStatistics {

    // to map time with store name that how much time each
    private final Map<String, Long> timeMap = Collections.synchronizedMap(new HashMap<String, Long>());

    void addTiming(String storeName, long time) {
        getTimeMap().put(storeName, time);
    }

    public Map<String, Long> getTimeMap() {
        return timeMap;
    }


}