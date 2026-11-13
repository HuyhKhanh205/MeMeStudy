package com.memestudy.backend.model;

import java.util.List;

public class SubmitRequestDto {
    private List<AnswerItem> answers;

    public static class AnswerItem {
        private int questionId;
        private Integer choiceId;

        public AnswerItem() {
        }

        public AnswerItem(int questionId, Integer choiceId) {
            this.questionId = questionId;
            this.choiceId = choiceId;
        }

        public int getQuestionId() {
            return questionId;
        }

        public void setQuestionId(int questionId) {
            this.questionId = questionId;
        }

        public Integer getChoiceId() {
            return choiceId;
        }

        public void setChoiceId(Integer choiceId) {
            this.choiceId = choiceId;
        }
    }

    public SubmitRequestDto() {
    }

    public List<AnswerItem> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerItem> answers) {
        this.answers = answers;
    }
}

