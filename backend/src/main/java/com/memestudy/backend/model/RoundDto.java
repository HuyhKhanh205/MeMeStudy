package com.memestudy.backend.model;

public class RoundDto {
    private int id;
    private String seasonId;
    private Integer prerequisiteRoundId;
    private int order;
    private String roundNumber;
    private String status; // "COMPLETED" | "IN_PROGRESS" | "LOCKED"
    private String title;
    private String description;
    private int durationMinutes;
    private int questionCount;
    private boolean isOpen;

    public RoundDto() {
    }

    public RoundDto(
            int id,
            String seasonId,
            int order,
            String roundNumber,
            String status,
            String title,
            String description,
            int durationMinutes,
            int questionCount,
            boolean isOpen
    ) {
        this(id, seasonId, order > 1 ? id - 1 : null, order, roundNumber, status, title, description, durationMinutes, questionCount, isOpen);
    }

    public RoundDto(
            int id,
            String seasonId,
            Integer prerequisiteRoundId,
            int order,
            String roundNumber,
            String status,
            String title,
            String description,
            int durationMinutes,
            int questionCount,
            boolean isOpen
    ) {
        this.id = id;
        this.seasonId = seasonId;
        this.prerequisiteRoundId = prerequisiteRoundId;
        this.order = order;
        this.roundNumber = roundNumber;
        this.status = status;
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.questionCount = questionCount;
        this.isOpen = isOpen;
    }

    public Integer getPrerequisiteRoundId() {
        return prerequisiteRoundId;
    }

    public void setPrerequisiteRoundId(Integer prerequisiteRoundId) {
        this.prerequisiteRoundId = prerequisiteRoundId;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getSeasonId() {
        return seasonId;
    }

    public void setSeasonId(String seasonId) {
        this.seasonId = seasonId;
    }

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }

    public String getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(String roundNumber) {
        this.roundNumber = roundNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public int getQuestionCount() {
        return questionCount;
    }

    public void setQuestionCount(int questionCount) {
        this.questionCount = questionCount;
    }

    public boolean getIsOpen() {
        return isOpen;
    }

    public void setIsOpen(boolean isOpen) {
        this.isOpen = isOpen;
    }
}

