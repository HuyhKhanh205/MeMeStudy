package com.memestudy.backend.model;

public class UserDto {
    private int id;
    private String username;
    private String fullName;
    private String gender;
    private String birthDate;
    private String className;
    private String role; // "USER" | "TEACHER" | "ADMIN"

    public UserDto() {
    }

    public UserDto(int id, String username, String fullName, String role) {
        this(id, username, fullName, "Nam", "15/05/2015", "Lớp 5A", role);
    }

    public UserDto(
            int id,
            String username,
            String fullName,
            String gender,
            String birthDate,
            String className,
            String role
    ) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.gender = gender != null ? gender : "Nam";
        this.birthDate = birthDate != null ? birthDate : "15/05/2015";
        this.className = className != null ? className : "Lớp 5A";
        this.role = role;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(String birthDate) {
        this.birthDate = birthDate;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
