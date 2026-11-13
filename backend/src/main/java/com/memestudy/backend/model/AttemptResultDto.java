package com.memestudy.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AttemptResultDto {
    private int attemptId;
    private int roundId;
    private String roundTitle;
    private int score;
    private int correctCount;
    private int totalQuestions;
    private String submittedAt;
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
        this.attemptId = attemptId;
        this.roundId = roundId;
        this.roundTitle = roundTitle;
        this.score = score;
        this.correctCount = correctCount;
        this.totalQuestions = totalQuestions;
        this.submittedAt = submittedAt;
        this.review = review;
    }

    public int getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(int attemptId) {
        this.attemptId = attemptId;
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

    public List<QuestionReviewItem> getReview() {
        return review;
    }

    public void setReview(List<QuestionReviewItem> review) {
        this.review = review;
    }
}

