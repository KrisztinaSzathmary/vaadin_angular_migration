package com.vaadin.samples.rest;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.vaadin.samples.authentication.AccessControl;
import com.vaadin.samples.backend.DataService;
import com.vaadin.samples.backend.data.Product;
import com.vaadin.samples.rest.dto.ProductDTO;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("products")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class ProductResource {

    @Inject
    private DataService dataService;

    @Inject
    private AccessControl accessControl;

    @Inject
    private Validator validator;

    @GET
    public List<ProductDTO> getAllProducts() {
        return dataService.getAllProducts().stream()
                .map(ProductDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GET
    @Path("{id}")
    public Response getProductById(@PathParam("id") int id) {
        Product product = dataService.getProductById(id);
        if (product == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"Product with id " + id + " not found\"}")
                    .build();
        }
        return Response.ok(ProductDTO.fromEntity(product)).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createProduct(ProductDTO dto) {
        Response authError = requireAdmin();
        if (authError != null) {
            return authError;
        }

        if (dto == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Request body is required\"}")
                    .build();
        }

        Response validationError = validate(dto);
        if (validationError != null) {
            return validationError;
        }

        Product product = dto.toEntity(dataService.getAllCategories());
        product.setId(-1);
        Product saved = dataService.updateProduct(product);
        return Response.status(Response.Status.CREATED)
                .entity(ProductDTO.fromEntity(saved))
                .build();
    }

    @PUT
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateProduct(@PathParam("id") int id, ProductDTO dto) {
        Response authError = requireAdmin();
        if (authError != null) {
            return authError;
        }

        if (dto == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Request body is required\"}")
                    .build();
        }

        Product existing = dataService.getProductById(id);
        if (existing == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"Product with id " + id + " not found\"}")
                    .build();
        }

        Response validationError = validate(dto);
        if (validationError != null) {
            return validationError;
        }

        Product product = dto.toEntity(dataService.getAllCategories());
        product.setId(id);
        Product saved = dataService.updateProduct(product);
        return Response.ok(ProductDTO.fromEntity(saved)).build();
    }

    @DELETE
    @Path("{id}")
    public Response deleteProduct(@PathParam("id") int id) {
        Response authError = requireAdmin();
        if (authError != null) {
            return authError;
        }

        Product existing = dataService.getProductById(id);
        if (existing == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"Product with id " + id + " not found\"}")
                    .build();
        }

        dataService.deleteProduct(id);
        return Response.noContent().build();
    }

    private Response requireAdmin() {
        if (!accessControl.isUserSignedIn()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Not authenticated\"}")
                    .build();
        }
        if (!accessControl.isUserInRole("admin")) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Admin role required\"}")
                    .build();
        }
        return null;
    }

    private Response validate(ProductDTO dto) {
        Set<ConstraintViolation<ProductDTO>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            String errors = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .sorted()
                    .collect(Collectors.joining(", "));
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"" + errors + "\"}")
                    .build();
        }
        return null;
    }
}
