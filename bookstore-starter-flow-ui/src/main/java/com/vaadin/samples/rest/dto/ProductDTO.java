package com.vaadin.samples.rest.dto;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.vaadin.samples.backend.data.Category;
import com.vaadin.samples.backend.data.Product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ProductDTO {

    private int id;
    @NotBlank(message = "Product name is required")
    @Size(min = 2, message = "Product name must be at least 2 characters")
    private String productName;
    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must not be negative")
    private BigDecimal price;
    @Min(value = 0, message = "Stock count must not be negative")
    private int stockCount;
    @NotNull(message = "Availability is required")
    private AvailabilityDTO availability;
    private List<CategoryDTO> category;

    public ProductDTO() {
    }

    public static ProductDTO fromEntity(Product product) {
        if (product == null) {
            return null;
        }
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setProductName(product.getProductName());
        dto.setPrice(product.getPrice());
        dto.setStockCount(product.getStockCount());
        dto.setAvailability(AvailabilityDTO.fromEntity(product.getAvailability()));
        dto.setCategory(product.getCategory() != null
                ? product.getCategory().stream()
                    .map(CategoryDTO::fromEntity)
                    .collect(Collectors.toList())
                : Collections.emptyList());
        return dto;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getStockCount() {
        return stockCount;
    }

    public void setStockCount(int stockCount) {
        this.stockCount = stockCount;
    }

    public AvailabilityDTO getAvailability() {
        return availability;
    }

    public void setAvailability(AvailabilityDTO availability) {
        this.availability = availability;
    }

    public List<CategoryDTO> getCategory() {
        return category;
    }

    public void setCategory(List<CategoryDTO> category) {
        this.category = category;
    }

    public Product toEntity(Collection<Category> allCategories) {
        Map<Integer, Category> categoryMap = allCategories.stream()
                .collect(Collectors.toMap(Category::getId, c -> c));

        Product product = new Product();
        product.setId(this.id);
        product.setProductName(this.productName);
        product.setPrice(this.price);
        product.setStockCount(this.stockCount);
        product.setAvailability(this.availability != null
                ? this.availability.toEntity() : null);

        if (this.category != null) {
            Set<Category> categories = new HashSet<>();
            for (CategoryDTO catDto : this.category) {
                Category cat = categoryMap.get(catDto.getId());
                if (cat != null) {
                    categories.add(cat);
                }
            }
            product.setCategory(categories);
        } else {
            product.setCategory(new HashSet<>());
        }

        return product;
    }
}
