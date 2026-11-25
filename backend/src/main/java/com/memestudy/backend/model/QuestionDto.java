package com.memestudy.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuestionDto {
    private int id;
    private Integer examId;
    private String type; // "TEXT" | "LISTENING" | "IMAGE"
    private String content;
    private List<String> options;
    private Integer correctIndex;
    private List<ChoiceDto> choices;
    private Integer correctChoiceId;
    private String audioUrl;
    private String imageUrl;
    private String explanation;

    public QuestionDto() {
    }

    public QuestionDto(
            int id,
            Integer examId,
            String type,
            String content,
            List<ChoiceDto> choices,
            Integer correctChoiceId,
            Integer correctIndex,
            String audioUrl,
            String imageUrl,
            String explanation
    ) {
        this.id = id;
        this.examId = examId;
        this.type = type != null ? type : "TEXT";
        this.content = content;
        this.choices = choices;
        this.options = new ArrayList<>();
        if (choices != null) {
            for (ChoiceDto c : choices) {
                this.options.add(c.getContent());
            }
        }
        this.correctChoiceId = correctChoiceId;
        this.correctIndex = correctIndex;
        this.audioUrl = audioUrl;
        this.imageUrl = imageUrl;
        this.explanation = explanation;
    }

    public QuestionDto(int id, String content, List<ChoiceDto> choices, Integer correctChoiceId, String explanation) {
        this(id, 201, "TEXT", content, choices, correctChoiceId, 0, null, null, explanation);
    }

    /** Bản sao ẩn đáp án đúng khi trả đề thi cho học sinh làm bài. */
    public QuestionDto withoutAnswer() {
        return new QuestionDto(
                this.id,
                this.examId,
                this.type,
                this.content,
                this.choices,
                null,
                null,
                this.audioUrl,
                this.imageUrl,
                null
        );
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Integer getExamId() {
        return examId;
    }

    public void setExamId(Integer examId) {
        this.examId = examId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public Integer getCorrectIndex() {
        return correctIndex;
    }

    public void setCorrectIndex(Integer correctIndex) {
        this.correctIndex = correctIndex;
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

    public String getAudioUrl() {
        return audioUrl;
    }

    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
