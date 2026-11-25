package com.memestudy.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AttemptResultDto {
    private int id;
    private int attemptId;
    private Integer userId;
    private String seasonId;
    private int roundId;
    private Integer examId;
    private String roundTitle;
    private String examTitle;
    private Integer examOrder;
    private int score;
    private int correctCount;
    private int totalQuestions;
    private String submittedAt;
    private Integer durationSeconds;
    private String mode;
    private List<QuestionReviewItem> review;

    public static class QuestionReviewItem {
        private int questionId;
        private boolean correct;
        private Integer choiceId;

        public QuestionReviewItem() {
        }

        public QuestionReviewItem(int questionId, boolean correct, Integer choiceId) {
            this.questionId = questionId;
            this.correct = correct;
            this.choiceId = choiceId;
        }

        public int getQuestionId() {
            return questionId;
        }

        public void setQuestionId(int questionId) {
            this.questionId = questionId;
        }

        public boolean isCorrect() {
            return correct;
        }

        public void setCorrect(boolean correct) {
            this.correct = correct;
        }

        public Integer getChoiceId() {
            return choiceId;
        }

        public void setChoiceId(Integer choiceId) {
            this.choiceId = choiceId;
        }
    }

    public AttemptResultDto() {
    }

    public AttemptResultDto(
            int attemptId,
            int roundId,
            String roundTitle,
            int score,
            int correctCount,
            int totalQuestions,
            String submittedAt,
            List<QuestionReviewItem> review
    ) {
        this(attemptId, 1, "2026-2027", roundId, 101, roundTitle, "Bài 1", 1, score, correctCount, totalQuestions, submittedAt, 420, "exam", review);
    }

    public AttemptResultDto(
            int attemptId,
            Integer userId,
            String seasonId,
            int roundId,
            Integer examId,
            String roundTitle,
            String examTitle,
            Integer examOrder,
            int score,
            int correctCount,
            int totalQuestions,
            String submittedAt,
            Integer durationSeconds,
            String mode,
            List<QuestionReviewItem> review
    ) {
        this.id = attemptId;
        this.attemptId = attemptId;
        this.userId = userId;
        this.seasonId = seasonId;
        this.roundId = roundId;
        this.examId = examId;
        this.roundTitle = roundTitle;
        this.examTitle = examTitle;
        this.examOrder = examOrder;
        this.score = score;
        this.correctCount = correctCount;
        this.totalQuestions = totalQuestions;
        this.submittedAt = submittedAt;
        this.durationSeconds = durationSeconds;
        this.mode = mode;
        this.review = review;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(int attemptId) {
        this.attemptId = attemptId;
        this.id = attemptId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getSeasonId() {
        return seasonId;
    }

    public void setSeasonId(String seasonId) {
        this.seasonId = seasonId;
    }

    public int getRoundId() {
        return roundId;
    }

    public void setRoundId(int roundId) {
        this.roundId = roundId;
    }

    public Integer getExamId() {
        return examId;
    }

    public void setExamId(Integer examId) {
        this.examId = examId;
    }

    public String getRoundTitle() {
        return roundTitle;
    }

    public void setRoundTitle(String roundTitle) {
        this.roundTitle = roundTitle;
    }

    public String getExamTitle() {
        return examTitle;
    }

    public void setExamTitle(String examTitle) {
        this.examTitle = examTitle;
    }

    public Integer getExamOrder() {
        return examOrder;
    }

    public void setExamOrder(Integer examOrder) {
        this.examOrder = examOrder;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getCorrectCount() {
        return correctCount;
    }

    public void setCorrectCount(int correctCount) {
        this.correctCount = correctCount;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public String getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(String submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public List<QuestionReviewItem> getReview() {
        return review;
    }

    public void setReview(List<QuestionReviewItem> review) {
        this.review = review;
    }
}
