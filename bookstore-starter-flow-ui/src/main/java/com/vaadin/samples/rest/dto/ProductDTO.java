package com.vaadin.samples.rest.dto;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import com.vaadin.samples.backend.data.Product;

public class ProductDTO {

    private int id;
    private String productName;
    private BigDecimal price;
    private int stockCount;
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
}
