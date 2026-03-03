package com.vaadin.samples.backend.rest;

import com.vaadin.samples.backend.DataService;
import com.vaadin.samples.backend.data.Category;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.Collection;

/**
 * REST API for Category operations.
 * Provides CRUD endpoints for categories.
 */
@Path("/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CategoryController {

    @Inject
    private DataService dataService;

    /**
     * Get all categories.
     * @return Collection of all categories
     */
    @GET
    public Collection<Category> getAllCategories() {
        return dataService.getAllCategories();
    }

    /**
     * Create a new category.
     * @param category Category to create
     * @return Created category with assigned ID
     */
    @POST
    public Response createCategory(Category category) {
        dataService.updateCategory(category);
        return Response.status(Response.Status.CREATED).entity(category).build();
    }

    /**
     * Update an existing category.
     * @param id Category ID
     * @param category Updated category data
     * @return Updated category
     */
    @PUT
    @Path("/{id}")
    public Response updateCategory(@PathParam("id") int id, Category category) {
        category.setId(id);
        dataService.updateCategory(category);
        return Response.ok(category).build();
    }

    /**
     * Delete a category.
     * @param id Category ID
     * @return 204 No Content on success
     */
    @DELETE
    @Path("/{id}")
    public Response deleteCategory(@PathParam("id") int id) {
        dataService.deleteCategory(id);
        return Response.noContent().build();
    }
}
