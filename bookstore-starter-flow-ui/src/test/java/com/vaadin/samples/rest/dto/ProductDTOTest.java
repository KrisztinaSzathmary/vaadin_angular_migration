package com.vaadin.samples.rest.dto;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

import com.vaadin.samples.backend.data.Availability;
import com.vaadin.samples.backend.data.Category;
import com.vaadin.samples.backend.data.Product;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProductDTOTest {

    @Test
    void fromEntity_mapsAllFieldsAndConvertsCategories() {
        Category cat1 = new Category();
        cat1.setId(1);
        cat1.setName("Sci-fi");

        Category cat2 = new Category();
        cat2.setId(2);
        cat2.setName("Thriller");

        Set<Category> categories = new LinkedHashSet<>();
        categories.add(cat1);
        categories.add(cat2);

        Product product = new Product();
        product.setId(42);
        product.setProductName("Test Book");
        product.setPrice(new BigDecimal("19.99"));
        product.setStockCount(100);
        product.setAvailability(Availability.AVAILABLE);
        product.setCategory(categories);

        ProductDTO dto = ProductDTO.fromEntity(product);

        assertEquals(42, dto.getId());
        assertEquals("Test Book", dto.getProductName());
        assertEquals(new BigDecimal("19.99"), dto.getPrice());
        assertEquals(100, dto.getStockCount());
        assertEquals(AvailabilityDTO.AVAILABLE, dto.getAvailability());
        assertNotNull(dto.getCategory());
        assertEquals(2, dto.getCategory().size());
    }

    @Test
    void fromEntity_nullCategories_returnsEmptyList() {
        Product product = new Product();
        product.setId(1);
        product.setProductName("No Categories");
        product.setCategory(null);

        ProductDTO dto = ProductDTO.fromEntity(product);

        assertNotNull(dto.getCategory());
        assertTrue(dto.getCategory().isEmpty());
    }
}
