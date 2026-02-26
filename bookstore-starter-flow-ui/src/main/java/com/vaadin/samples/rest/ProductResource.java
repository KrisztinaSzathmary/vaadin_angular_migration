package com.vaadin.samples.rest;

import java.util.List;
import java.util.stream.Collectors;

import com.vaadin.samples.backend.DataService;
import com.vaadin.samples.backend.data.Product;
import com.vaadin.samples.rest.dto.ProductDTO;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
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
}
