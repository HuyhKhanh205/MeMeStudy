package com.memestudy.backend.model;

import java.util.List;

public class AttemptDto {
    private int id;
    private int userId;
    private int roundId;
    private String roundTitle;
    private String status; // "IN_PROGRESS" | "SUBMITTED"
    private String startedAt;
    private String expiresAt;
    private List<QuestionDto> questions;

    public AttemptDto() {
    }

    public AttemptDto(
            int id,
            int userId,
            int roundId,
            String roundTitle,
            String status,
            String startedAt,
            String expiresAt,
            List<QuestionDto> questions
    ) {
        this.id = id;
        this.userId = userId;
        this.roundId = roundId;
        this.roundTitle = roundTitle;
        this.status = status;
        this.startedAt = startedAt;
        this.expiresAt = expiresAt;
        this.questions = questions;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public int getRoundId() {
        return roundId;
    }

    public void setRoundId(int roundId) {
        this.roundId = roundId;
    }

    public String getRoundTitle() {
        return roundTitle;
    }

    public void setRoundTitle(String roundTitle) {
        this.roundTitle = roundTitle;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(String startedAt) {
        this.startedAt = startedAt;
    }

    public String getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(String expiresAt) {
        this.expiresAt = expiresAt;
    }

    public List<QuestionDto> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionDto> questions) {
        this.questions = questions;
    }
}

