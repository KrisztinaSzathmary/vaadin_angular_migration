package com.vaadin.samples.backend.rest;

import com.vaadin.samples.backend.rest.dto.LoginRequest;
import com.vaadin.samples.backend.rest.dto.LoginResponse;
import com.vaadin.samples.backend.security.JwtTokenProvider;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * REST API for Authentication.
 * Provides login/logout endpoints with JWT token management.
 */
@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthController {

    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_ROLE = "admin";
    private static final String USER_ROLE = "user";

    @Inject
    private JwtTokenProvider jwtTokenProvider;

    /**
     * Login endpoint.
     * Validates credentials and returns JWT token.
     * Authentication logic: username must equal password (mock implementation).
     *
     * @param loginRequest Login credentials
     * @return JWT token and user info on success, 401 on failure
     */
    @POST
    @Path("/login")
    public Response login(LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();

        // Mock authentication: username must equal password
        if (username == null || password == null || !username.equals(password)) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\": \"Invalid credentials\"}")
                    .build();
        }

        // Determine role
        String role = ADMIN_USERNAME.equals(username) ? ADMIN_ROLE : USER_ROLE;

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(username, role);

        LoginResponse response = new LoginResponse(
                token,
                username,
                role,
                jwtTokenProvider.getExpirationTime()
        );

        return Response.ok(response).build();
    }

    /**
     * Logout endpoint.
     * For JWT, logout is handled client-side by removing the token.
     * This endpoint is provided for API consistency.
     *
     * @return 200 OK
     */
    @POST
    @Path("/logout")
    public Response logout() {
        return Response.ok("{\"message\": \"Logged out successfully\"}").build();
    }

    /**
     * Get current user info from JWT token.
     *
     * @param headers HTTP headers containing Authorization
     * @return User info or 401 if not authenticated
     */
    @GET
    @Path("/me")
    public Response getCurrentUser(@Context HttpHeaders headers) {
        String authHeader = headers.getHeaderString(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\": \"No token provided\"}")
                    .build();
        }

        String token = authHeader.substring(7);

        if (!jwtTokenProvider.validateToken(token)) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\": \"Invalid or expired token\"}")
                    .build();
        }

        String username = jwtTokenProvider.getUsernameFromToken(token);
        String role = jwtTokenProvider.getRoleFromToken(token);

        return Response.ok(new LoginResponse(null, username, role, 0)).build();
    }
}
