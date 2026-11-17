package com.memestudy.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuestionDto {
    private int id;
    private String content;
    private List<ChoiceDto> choices;
    private Integer correctChoiceId;
    private String explanation;

    public QuestionDto() {
    }

    public QuestionDto(int id, String content, List<ChoiceDto> choices, Integer correctChoiceId, String explanation) {
        this.id = id;
        this.content = content;
        this.choices = choices;
        this.correctChoiceId = correctChoiceId;
        this.explanation = explanation;
    }

    /** Bản sao ẩn đáp án đúng khi trả đề thi cho học sinh làm bài. */
    public QuestionDto withoutAnswer() {
        return new QuestionDto(this.id, this.content, this.choices, null, null);
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

    public List<ChoiceDto> getChoices() {
        return choices;
    }

    public void setChoices(List<ChoiceDto> choices) {
        this.choices = choices;
    }

    public Integer getCorrectChoiceId() {
        return correctChoiceId;
    }

    public void setCorrectChoiceId(Integer correctChoiceId) {
        this.correctChoiceId = correctChoiceId;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}

