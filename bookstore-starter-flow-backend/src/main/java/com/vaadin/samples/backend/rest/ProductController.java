package com.vaadin.samples.backend.rest;

import com.vaadin.samples.backend.DataService;
import com.vaadin.samples.backend.data.Product;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.Collection;

/**
 * REST API for Product operations.
 * Provides CRUD endpoints for products.
 */
@Path("/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductController {

    @Inject
    private DataService dataService;

    /**
     * Get all products.
     * @return Collection of all products
     */
    @GET
    public Collection<Product> getAllProducts() {
        return dataService.getAllProducts();
    }

    /**
     * Get a single product by ID.
     * @param id Product ID
     * @return Product or 404 if not found
     */
    @GET
    @Path("/{id}")
    public Response getProductById(@PathParam("id") int id) {
        Product product = dataService.getProductById(id);
        if (product == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"Product not found\"}")
                    .build();
        }
        return Response.ok(product).build();
    }

    /**
     * Create a new product.
     * @param product Product to create (id should be -1 or not set)
     * @return Created product with assigned ID
     */
    @POST
    public Response createProduct(Product product) {
        if (product.getId() > 0) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Use PUT to update existing products\"}")
                    .build();
        }
        Product saved = dataService.updateProduct(product);
        return Response.status(Response.Status.CREATED).entity(saved).build();
    }

    /**
     * Update an existing product.
     * @param id Product ID
     * @param product Updated product data
     * @return Updated product
     */
    @PUT
    @Path("/{id}")
    public Response updateProduct(@PathParam("id") int id, Product product) {
        Product existing = dataService.getProductById(id);
        if (existing == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"Product not found\"}")
                    .build();
        }
        product.setId(id);
        Product updated = dataService.updateProduct(product);
        return Response.ok(updated).build();
    }

    /**
     * Delete a product.
     * @param id Product ID
     * @return 204 No Content on success
     */
    @DELETE
    @Path("/{id}")
    public Response deleteProduct(@PathParam("id") int id) {
        Product existing = dataService.getProductById(id);
        if (existing == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"Product not found\"}")
                    .build();
        }
        dataService.deleteProduct(id);
        return Response.noContent().build();
    }
}
