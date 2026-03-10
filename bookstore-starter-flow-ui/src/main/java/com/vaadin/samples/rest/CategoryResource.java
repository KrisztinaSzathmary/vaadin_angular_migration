package com.vaadin.samples.rest;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.vaadin.samples.authentication.AccessControl;
import com.vaadin.samples.backend.DataService;
import com.vaadin.samples.backend.data.Category;
import com.vaadin.samples.rest.dto.CategoryDTO;

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

@Path("categories")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class CategoryResource {

    @Inject
    private DataService dataService;

    @Inject
    private AccessControl accessControl;

    @Inject
    private Validator validator;

    @GET
    public List<CategoryDTO> getAllCategories() {
        return dataService.getAllCategories().stream()
                .map(CategoryDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createCategory(CategoryDTO dto) {
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

        Category category = dto.toEntity();
        category.setId(-1);
        dataService.updateCategory(category);
        return Response.status(Response.Status.CREATED)
                .entity(CategoryDTO.fromEntity(category))
                .build();
    }

    @PUT
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateCategory(@PathParam("id") int id, CategoryDTO dto) {
        Response authError = requireAdmin();
        if (authError != null) {
            return authError;
        }

        if (dto == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Request body is required\"}")
                    .build();
        }

        Category existing = findCategoryById(id);
        if (existing == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"Category with id " + id + " not found\"}")
                    .build();
        }

        Response validationError = validate(dto);
        if (validationError != null) {
            return validationError;
        }

        existing.setName(dto.getName());
        dataService.updateCategory(existing);
        return Response.ok(CategoryDTO.fromEntity(existing)).build();
    }

    @DELETE
    @Path("{id}")
    public Response deleteCategory(@PathParam("id") int id) {
        Response authError = requireAdmin();
        if (authError != null) {
            return authError;
        }

        Category existing = findCategoryById(id);
        if (existing == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"Category with id " + id + " not found\"}")
                    .build();
        }

        dataService.deleteCategory(id);
        return Response.noContent().build();
    }

    private Category findCategoryById(int id) {
        return dataService.getAllCategories().stream()
                .filter(c -> c.getId() == id)
                .findFirst()
                .orElse(null);
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

    private Response validate(CategoryDTO dto) {
        Set<ConstraintViolation<CategoryDTO>> violations = validator.validate(dto);
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
