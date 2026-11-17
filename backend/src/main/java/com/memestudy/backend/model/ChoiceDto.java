package com.memestudy.backend.model;

public class ChoiceDto {
    private int id;
    private String content;

    public ChoiceDto() {
    }

    public ChoiceDto(int id, String content) {
        this.id = id;
        this.content = content;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}

