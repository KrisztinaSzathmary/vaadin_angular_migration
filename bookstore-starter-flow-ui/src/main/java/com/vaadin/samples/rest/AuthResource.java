package com.vaadin.samples.rest;

import com.vaadin.samples.authentication.AccessControl;
import com.vaadin.samples.rest.dto.LoginRequestDTO;
import com.vaadin.samples.rest.dto.LoginResponseDTO;
import com.vaadin.samples.rest.dto.UserInfoDTO;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("auth")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    private AccessControl accessControl;

    @Context
    private HttpServletRequest request;

    @POST
    @Path("login")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response login(LoginRequestDTO loginRequest) {
        if (loginRequest == null || loginRequest.getUsername() == null
                || loginRequest.getPassword() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Username and password are required\"}")
                    .build();
        }

        boolean success = accessControl.signIn(loginRequest.getUsername(),
                loginRequest.getPassword());
        if (!success) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid username or password\"}")
                    .build();
        }

        request.changeSessionId();

        String role = accessControl.isUserInRole("admin") ? "admin" : "user";
        LoginResponseDTO responseDTO = new LoginResponseDTO(
                accessControl.getPrincipalName(), role);
        return Response.ok(responseDTO).build();
    }

    @POST
    @Path("logout")
    public Response logout() {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return Response.noContent().build();
    }

    @GET
    @Path("me")
    public Response me() {
        if (!accessControl.isUserSignedIn()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Not authenticated\"}")
                    .build();
        }

        String role = accessControl.isUserInRole("admin") ? "admin" : "user";
        UserInfoDTO userInfo = new UserInfoDTO(
                accessControl.getPrincipalName(), role);
        return Response.ok(userInfo).build();
    }
}
