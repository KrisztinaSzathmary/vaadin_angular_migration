package com.vaadin.samples.rest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import com.vaadin.samples.authentication.AccessControl;
import com.vaadin.samples.backend.DataService;
import com.vaadin.samples.backend.data.Availability;
import com.vaadin.samples.backend.data.Category;
import com.vaadin.samples.backend.data.Product;
import com.vaadin.samples.rest.dto.AvailabilityDTO;
import com.vaadin.samples.rest.dto.CategoryDTO;
import com.vaadin.samples.rest.dto.ProductDTO;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductResourceTest {

    @Mock
    private DataService dataService;

    @Mock
    private AccessControl accessControl;

    @InjectMocks
    private ProductResource productResource;

    private Product sampleProduct;
    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        // Inject a real Validator instance (Mockito can't auto-inject it)
        Validator validator = Validation.byDefaultProvider()
                .configure()
                .messageInterpolator(new ParameterMessageInterpolator())
                .buildValidatorFactory()
                .getValidator();
        productResource.getClass();
        try {
            java.lang.reflect.Field validatorField =
                    ProductResource.class.getDeclaredField("validator");
            validatorField.setAccessible(true);
            validatorField.set(productResource, validator);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        sampleCategory = new Category();
        sampleCategory.setId(1);
        sampleCategory.setName("Sci-fi");

        sampleProduct = new Product();
        sampleProduct.setId(1);
        sampleProduct.setProductName("Test Book");
        sampleProduct.setPrice(new BigDecimal("25.50"));
        sampleProduct.setStockCount(42);
        sampleProduct.setAvailability(Availability.AVAILABLE);
        sampleProduct.setCategory(Set.of(sampleCategory));
    }

    // ===== GET tests (existing) =====

    @Test
    void getAllProducts_returnsAllProducts() {
        Product product2 = new Product();
        product2.setId(2);
        product2.setProductName("Another Book");
        product2.setPrice(new BigDecimal("10.00"));
        product2.setAvailability(Availability.COMING);
        product2.setCategory(Set.of());

        when(dataService.getAllProducts()).thenReturn(List.of(sampleProduct, product2));

        List<ProductDTO> result = productResource.getAllProducts();

        assertEquals(2, result.size());
        assertEquals("Test Book", result.get(0).getProductName());
        assertEquals("Another Book", result.get(1).getProductName());
    }

    @Test
    void getAllProducts_emptyList() {
        when(dataService.getAllProducts()).thenReturn(List.of());

        List<ProductDTO> result = productResource.getAllProducts();

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void getProductById_found_returns200() {
        when(dataService.getProductById(1)).thenReturn(sampleProduct);

        Response response = productResource.getProductById(1);

        assertEquals(200, response.getStatus());
        ProductDTO dto = (ProductDTO) response.getEntity();
        assertEquals(1, dto.getId());
        assertEquals("Test Book", dto.getProductName());
        assertEquals(new BigDecimal("25.50"), dto.getPrice());
        assertEquals(42, dto.getStockCount());
        assertEquals(AvailabilityDTO.AVAILABLE, dto.getAvailability());
        assertEquals(1, dto.getCategory().size());
    }

    @Test
    void getProductById_notFound_returns404() {
        when(dataService.getProductById(99999)).thenReturn(null);

        Response response = productResource.getProductById(99999);

        assertEquals(404, response.getStatus());
        String entity = (String) response.getEntity();
        assertNotNull(entity);
    }

    // ===== POST tests =====

    @Test
    void createProduct_asAdmin_returns201() {
        mockAdmin();
        when(dataService.getAllCategories()).thenReturn(List.of(sampleCategory));
        Product saved = new Product();
        saved.setId(101);
        saved.setProductName("New Book");
        saved.setPrice(new BigDecimal("19.99"));
        saved.setStockCount(10);
        saved.setAvailability(Availability.AVAILABLE);
        saved.setCategory(Set.of(sampleCategory));
        when(dataService.updateProduct(any(Product.class))).thenReturn(saved);

        ProductDTO dto = createValidProductDTO();

        Response response = productResource.createProduct(dto);

        assertEquals(201, response.getStatus());
        ProductDTO result = (ProductDTO) response.getEntity();
        assertEquals(101, result.getId());
        assertEquals("New Book", result.getProductName());
    }

    @Test
    void createProduct_notAuthenticated_returns401() {
        when(accessControl.isUserSignedIn()).thenReturn(false);

        Response response = productResource.createProduct(createValidProductDTO());

        assertEquals(401, response.getStatus());
        verify(dataService, never()).updateProduct(any());
    }

    @Test
    void createProduct_notAdmin_returns403() {
        when(accessControl.isUserSignedIn()).thenReturn(true);
        when(accessControl.isUserInRole("admin")).thenReturn(false);

        Response response = productResource.createProduct(createValidProductDTO());

        assertEquals(403, response.getStatus());
        verify(dataService, never()).updateProduct(any());
    }

    @Test
    void createProduct_nullBody_returns400() {
        mockAdmin();

        Response response = productResource.createProduct(null);

        assertEquals(400, response.getStatus());
    }

    @Test
    void createProduct_invalidData_returns400() {
        mockAdmin();

        ProductDTO dto = new ProductDTO();
        // productName is null/blank -> validation fails

        Response response = productResource.createProduct(dto);

        assertEquals(400, response.getStatus());
        String entity = (String) response.getEntity();
        assertNotNull(entity);
    }

    @Test
    void createProduct_setsIdToNew() {
        mockAdmin();
        when(dataService.getAllCategories()).thenReturn(List.of(sampleCategory));
        Product saved = new Product(sampleProduct);
        saved.setId(101);
        when(dataService.updateProduct(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            assertEquals(-1, p.getId());
            return saved;
        });

        productResource.createProduct(createValidProductDTO());

        verify(dataService).updateProduct(any(Product.class));
    }

    // ===== PUT tests =====

    @Test
    void updateProduct_asAdmin_returns200() {
        mockAdmin();
        when(dataService.getProductById(1)).thenReturn(sampleProduct);
        when(dataService.getAllCategories()).thenReturn(List.of(sampleCategory));
        Product updated = new Product(sampleProduct);
        updated.setProductName("Updated Book");
        when(dataService.updateProduct(any(Product.class))).thenReturn(updated);

        ProductDTO dto = createValidProductDTO();

        Response response = productResource.updateProduct(1, dto);

        assertEquals(200, response.getStatus());
        ProductDTO result = (ProductDTO) response.getEntity();
        assertEquals("Updated Book", result.getProductName());
    }

    @Test
    void updateProduct_notAuthenticated_returns401() {
        when(accessControl.isUserSignedIn()).thenReturn(false);

        Response response = productResource.updateProduct(1, createValidProductDTO());

        assertEquals(401, response.getStatus());
        verify(dataService, never()).updateProduct(any());
    }

    @Test
    void updateProduct_notAdmin_returns403() {
        when(accessControl.isUserSignedIn()).thenReturn(true);
        when(accessControl.isUserInRole("admin")).thenReturn(false);

        Response response = productResource.updateProduct(1, createValidProductDTO());

        assertEquals(403, response.getStatus());
        verify(dataService, never()).updateProduct(any());
    }

    @Test
    void updateProduct_notFound_returns404() {
        mockAdmin();
        when(dataService.getProductById(99999)).thenReturn(null);

        Response response = productResource.updateProduct(99999, createValidProductDTO());

        assertEquals(404, response.getStatus());
    }

    @Test
    void updateProduct_nullBody_returns400() {
        mockAdmin();

        Response response = productResource.updateProduct(1, null);

        assertEquals(400, response.getStatus());
    }

    @Test
    void updateProduct_invalidData_returns400() {
        mockAdmin();
        when(dataService.getProductById(1)).thenReturn(sampleProduct);

        ProductDTO dto = new ProductDTO();

        Response response = productResource.updateProduct(1, dto);

        assertEquals(400, response.getStatus());
    }

    @Test
    void updateProduct_setsCorrectId() {
        mockAdmin();
        when(dataService.getProductById(1)).thenReturn(sampleProduct);
        when(dataService.getAllCategories()).thenReturn(List.of(sampleCategory));
        when(dataService.updateProduct(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            assertEquals(1, p.getId());
            return p;
        });

        ProductDTO dto = createValidProductDTO();

        productResource.updateProduct(1, dto);

        verify(dataService).updateProduct(any(Product.class));
    }

    // ===== DELETE tests =====

    @Test
    void deleteProduct_asAdmin_returns204() {
        mockAdmin();
        when(dataService.getProductById(1)).thenReturn(sampleProduct);

        Response response = productResource.deleteProduct(1);

        assertEquals(204, response.getStatus());
        verify(dataService).deleteProduct(1);
    }

    @Test
    void deleteProduct_notAuthenticated_returns401() {
        when(accessControl.isUserSignedIn()).thenReturn(false);

        Response response = productResource.deleteProduct(1);

        assertEquals(401, response.getStatus());
        verify(dataService, never()).deleteProduct(1);
    }

    @Test
    void deleteProduct_notAdmin_returns403() {
        when(accessControl.isUserSignedIn()).thenReturn(true);
        when(accessControl.isUserInRole("admin")).thenReturn(false);

        Response response = productResource.deleteProduct(1);

        assertEquals(403, response.getStatus());
        verify(dataService, never()).deleteProduct(1);
    }

    @Test
    void deleteProduct_notFound_returns404() {
        mockAdmin();
        when(dataService.getProductById(99999)).thenReturn(null);

        Response response = productResource.deleteProduct(99999);

        assertEquals(404, response.getStatus());
        verify(dataService, never()).deleteProduct(99999);
    }

    // ===== Helper methods =====

    private void mockAdmin() {
        when(accessControl.isUserSignedIn()).thenReturn(true);
        when(accessControl.isUserInRole("admin")).thenReturn(true);
    }

    private ProductDTO createValidProductDTO() {
        ProductDTO dto = new ProductDTO();
        dto.setProductName("New Book");
        dto.setPrice(new BigDecimal("19.99"));
        dto.setStockCount(10);
        dto.setAvailability(AvailabilityDTO.AVAILABLE);
        dto.setCategory(List.of(new CategoryDTO(1, "Sci-fi")));
        return dto;
    }
}
