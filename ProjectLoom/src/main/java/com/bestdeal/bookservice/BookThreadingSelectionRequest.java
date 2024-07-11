package com.bestdeal.bookservice;

public class BookThreadingSelectionRequest {
    private String bookName;
    private String threadingModel;

    // Getters and setters
    public String getBookName() {
        return bookName;
    }

    public void setBookName(String bookName) {
        this.bookName = bookName;
    }

    public String getThreadingModel() {
        return threadingModel;
    }

    public void setThreadingModel(String threadingModel) {
        this.threadingModel = threadingModel;
    }
}
