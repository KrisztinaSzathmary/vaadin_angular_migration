package com.vaadin.samples.rest;

import java.util.ArrayList;
import java.util.List;

import com.vaadin.samples.authentication.AccessControl;
import com.vaadin.samples.backend.DataService;
import com.vaadin.samples.backend.data.Category;
import com.vaadin.samples.rest.dto.CategoryDTO;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.ws.rs.core.Response;
import org.hibernate.validator.messageinterpolation.ParameterMessageInterpolator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryResourceTest {

    @Mock
    private DataService dataService;

    @Mock
    private AccessControl accessControl;

    @InjectMocks
    private CategoryResource categoryResource;

    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        Validator validator = Validation.byDefaultProvider()
                .configure()
                .messageInterpolator(new ParameterMessageInterpolator())
                .buildValidatorFactory()
                .getValidator();
        try {
            java.lang.reflect.Field validatorField =
                    CategoryResource.class.getDeclaredField("validator");
            validatorField.setAccessible(true);
            validatorField.set(categoryResource, validator);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        sampleCategory = new Category();
        sampleCategory.setId(1);
        sampleCategory.setName("Sci-fi");
    }

    // ===== GET /categories =====

    @Test
    void getAllCategories_returnsList() {
        Category cat2 = new Category();
        cat2.setId(2);
        cat2.setName("Fantasy");

        when(dataService.getAllCategories()).thenReturn(List.of(sampleCategory, cat2));

        List<CategoryDTO> result = categoryResource.getAllCategories();

        assertEquals(2, result.size());
        assertEquals("Sci-fi", result.get(0).getName());
        assertEquals(1, result.get(0).getId());
        assertEquals("Fantasy", result.get(1).getName());
        assertEquals(2, result.get(1).getId());
    }

    @Test
    void getAllCategories_emptyList() {
        when(dataService.getAllCategories()).thenReturn(List.of());

        List<CategoryDTO> result = categoryResource.getAllCategories();

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void getAllCategories_noAuthRequired() {
        when(dataService.getAllCategories()).thenReturn(List.of(sampleCategory));

        List<CategoryDTO> result = categoryResource.getAllCategories();

        assertEquals(1, result.size());
        // No auth mocking needed – GET is open
    }

    // ===== POST /categories =====

    @Test
    void createCategory_asAdmin_returns201() {
        mockAdmin();

        CategoryDTO dto = createValidCategoryDTO();

        Response response = categoryResource.createCategory(dto);

        assertEquals(201, response.getStatus());
        CategoryDTO result = (CategoryDTO) response.getEntity();
        assertNotNull(result);
        assertEquals("Horror", result.getName());
        verify(dataService).updateCategory(any(Category.class));
    }

    @Test
    void createCategory_notAuthenticated_returns401() {
        when(accessControl.isUserSignedIn()).thenReturn(false);

        Response response = categoryResource.createCategory(createValidCategoryDTO());

        assertEquals(401, response.getStatus());
        verify(dataService, never()).updateCategory(any());
    }

    @Test
    void createCategory_notAdmin_returns403() {
        when(accessControl.isUserSignedIn()).thenReturn(true);
        when(accessControl.isUserInRole("admin")).thenReturn(false);

        Response response = categoryResource.createCategory(createValidCategoryDTO());

        assertEquals(403, response.getStatus());
        verify(dataService, never()).updateCategory(any());
    }

    @Test
    void createCategory_nullBody_returns400() {
        mockAdmin();

        Response response = categoryResource.createCategory(null);

        assertEquals(400, response.getStatus());
    }

    @Test
    void createCategory_invalidName_returns400() {
        mockAdmin();

        CategoryDTO dto = new CategoryDTO();
        dto.setName("A"); // Too short (min 2)

        Response response = categoryResource.createCategory(dto);

        assertEquals(400, response.getStatus());
        String entity = (String) response.getEntity();
        assertNotNull(entity);
    }

    @Test
    void createCategory_blankName_returns400() {
        mockAdmin();

        CategoryDTO dto = new CategoryDTO();
        dto.setName(""); // Blank

        Response response = categoryResource.createCategory(dto);

        assertEquals(400, response.getStatus());
    }

    // ===== PUT /categories/{id} =====

    @Test
    void updateCategory_asAdmin_returns200() {
        mockAdmin();
        // findCategoryById iterates getAllCategories
        List<Category> categories = new ArrayList<>();
        categories.add(sampleCategory);
        when(dataService.getAllCategories()).thenReturn(categories);

        CategoryDTO dto = new CategoryDTO();
        dto.setName("Updated Sci-fi");

        Response response = categoryResource.updateCategory(1, dto);

        assertEquals(200, response.getStatus());
        CategoryDTO result = (CategoryDTO) response.getEntity();
        assertEquals("Updated Sci-fi", result.getName());
        assertEquals(1, result.getId());
        verify(dataService).updateCategory(any(Category.class));
    }

    @Test
    void updateCategory_notAuthenticated_returns401() {
        when(accessControl.isUserSignedIn()).thenReturn(false);

        Response response = categoryResource.updateCategory(1, createValidCategoryDTO());

        assertEquals(401, response.getStatus());
        verify(dataService, never()).updateCategory(any());
    }

    @Test
    void updateCategory_notAdmin_returns403() {
        when(accessControl.isUserSignedIn()).thenReturn(true);
        when(accessControl.isUserInRole("admin")).thenReturn(false);

        Response response = categoryResource.updateCategory(1, createValidCategoryDTO());

        assertEquals(403, response.getStatus());
        verify(dataService, never()).updateCategory(any());
    }

    @Test
    void updateCategory_notFound_returns404() {
        mockAdmin();
        when(dataService.getAllCategories()).thenReturn(List.of());

        Response response = categoryResource.updateCategory(99, createValidCategoryDTO());

        assertEquals(404, response.getStatus());
    }

    @Test
    void updateCategory_nullBody_returns400() {
        mockAdmin();

        Response response = categoryResource.updateCategory(1, null);

        assertEquals(400, response.getStatus());
    }

    @Test
    void updateCategory_invalidName_returns400() {
        mockAdmin();
        List<Category> categories = new ArrayList<>();
        categories.add(sampleCategory);
        when(dataService.getAllCategories()).thenReturn(categories);

        CategoryDTO dto = new CategoryDTO();
        dto.setName("A"); // Too short

        Response response = categoryResource.updateCategory(1, dto);

        assertEquals(400, response.getStatus());
    }

    // ===== DELETE /categories/{id} =====

    @Test
    void deleteCategory_asAdmin_returns204() {
        mockAdmin();
        List<Category> categories = new ArrayList<>();
        categories.add(sampleCategory);
        when(dataService.getAllCategories()).thenReturn(categories);

        Response response = categoryResource.deleteCategory(1);

        assertEquals(204, response.getStatus());
        assertNull(response.getEntity());
        verify(dataService).deleteCategory(1);
    }

    @Test
    void deleteCategory_notAuthenticated_returns401() {
        when(accessControl.isUserSignedIn()).thenReturn(false);

        Response response = categoryResource.deleteCategory(1);

        assertEquals(401, response.getStatus());
        verify(dataService, never()).deleteCategory(anyInt());
    }

    @Test
    void deleteCategory_notAdmin_returns403() {
        when(accessControl.isUserSignedIn()).thenReturn(true);
        when(accessControl.isUserInRole("admin")).thenReturn(false);

        Response response = categoryResource.deleteCategory(1);

        assertEquals(403, response.getStatus());
        verify(dataService, never()).deleteCategory(anyInt());
    }

    @Test
    void deleteCategory_notFound_returns404() {
        mockAdmin();
        when(dataService.getAllCategories()).thenReturn(List.of());

        Response response = categoryResource.deleteCategory(99);

        assertEquals(404, response.getStatus());
        verify(dataService, never()).deleteCategory(anyInt());
    }

    // ===== Helper methods =====

    private void mockAdmin() {
        when(accessControl.isUserSignedIn()).thenReturn(true);
        when(accessControl.isUserInRole("admin")).thenReturn(true);
    }

    private CategoryDTO createValidCategoryDTO() {
        CategoryDTO dto = new CategoryDTO();
        dto.setName("Horror");
        return dto;
    }
}
