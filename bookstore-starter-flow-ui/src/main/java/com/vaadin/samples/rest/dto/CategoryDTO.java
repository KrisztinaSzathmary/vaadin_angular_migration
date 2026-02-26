package com.vaadin.samples.rest.dto;

import com.vaadin.samples.backend.data.Category;

public class CategoryDTO {

    private int id;
    private String name;

    public CategoryDTO() {
    }

    public CategoryDTO(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public static CategoryDTO fromEntity(Category category) {
        if (category == null) {
            return null;
        }
        return new CategoryDTO(category.getId(), category.getName());
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
