package com.vaadin.samples.rest;

import com.vaadin.samples.authentication.AccessControl;
import com.vaadin.samples.rest.dto.LoginRequestDTO;
import com.vaadin.samples.rest.dto.LoginResponseDTO;
import com.vaadin.samples.rest.dto.UserInfoDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.core.Response;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthResourceTest {

    @Mock
    private AccessControl accessControl;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpSession session;

    @InjectMocks
    private AuthResource authResource;

    @Test
    void login_validCredentials_returns200WithUserInfo() {
        LoginRequestDTO loginRequest = new LoginRequestDTO("user1", "user1");
        when(accessControl.signIn("user1", "user1")).thenReturn(true);
        when(accessControl.isUserInRole("admin")).thenReturn(false);
        when(accessControl.getPrincipalName()).thenReturn("user1");

        Response response = authResource.login(loginRequest);

        assertEquals(200, response.getStatus());
        LoginResponseDTO dto = (LoginResponseDTO) response.getEntity();
        assertEquals("user1", dto.getUsername());
        assertEquals("user", dto.getRole());
    }

    @Test
    void login_adminUser_returnsAdminRole() {
        LoginRequestDTO loginRequest = new LoginRequestDTO("admin", "admin");
        when(accessControl.signIn("admin", "admin")).thenReturn(true);
        when(accessControl.isUserInRole("admin")).thenReturn(true);
        when(accessControl.getPrincipalName()).thenReturn("admin");

        Response response = authResource.login(loginRequest);

        assertEquals(200, response.getStatus());
        LoginResponseDTO dto = (LoginResponseDTO) response.getEntity();
        assertEquals("admin", dto.getUsername());
        assertEquals("admin", dto.getRole());
    }

    @Test
    void login_regularUser_returnsUserRole() {
        LoginRequestDTO loginRequest = new LoginRequestDTO("user2", "user2");
        when(accessControl.signIn("user2", "user2")).thenReturn(true);
        when(accessControl.isUserInRole("admin")).thenReturn(false);
        when(accessControl.getPrincipalName()).thenReturn("user2");

        Response response = authResource.login(loginRequest);

        assertEquals(200, response.getStatus());
        LoginResponseDTO dto = (LoginResponseDTO) response.getEntity();
        assertEquals("user2", dto.getUsername());
        assertEquals("user", dto.getRole());
    }

    @Test
    void login_invalidCredentials_returns401() {
        LoginRequestDTO loginRequest = new LoginRequestDTO("user1", "wrong");
        when(accessControl.signIn("user1", "wrong")).thenReturn(false);

        Response response = authResource.login(loginRequest);

        assertEquals(401, response.getStatus());
        String entity = (String) response.getEntity();
        assertNotNull(entity);
    }

    @Test
    void login_nullRequest_returns400() {
        Response response = authResource.login(null);

        assertEquals(400, response.getStatus());
    }

    @Test
    void login_nullUsername_returns400() {
        LoginRequestDTO loginRequest = new LoginRequestDTO(null, "password");

        Response response = authResource.login(loginRequest);

        assertEquals(400, response.getStatus());
    }

    @Test
    void login_nullPassword_returns400() {
        LoginRequestDTO loginRequest = new LoginRequestDTO("user1", null);

        Response response = authResource.login(loginRequest);

        assertEquals(400, response.getStatus());
    }

    @Test
    void login_success_changesSessionId() {
        LoginRequestDTO loginRequest = new LoginRequestDTO("user1", "user1");
        when(accessControl.signIn("user1", "user1")).thenReturn(true);
        when(accessControl.isUserInRole("admin")).thenReturn(false);
        when(accessControl.getPrincipalName()).thenReturn("user1");

        authResource.login(loginRequest);

        verify(request).changeSessionId();
    }

    @Test
    void logout_withSession_invalidatesAndReturns204() {
        when(request.getSession(false)).thenReturn(session);

        Response response = authResource.logout();

        assertEquals(204, response.getStatus());
        verify(session).invalidate();
    }

    @Test
    void logout_noSession_returns204() {
        when(request.getSession(false)).thenReturn(null);

        Response response = authResource.logout();

        assertEquals(204, response.getStatus());
    }

    @Test
    void me_authenticatedUser_returns200WithUserInfo() {
        when(accessControl.isUserSignedIn()).thenReturn(true);
        when(accessControl.isUserInRole("admin")).thenReturn(false);
        when(accessControl.getPrincipalName()).thenReturn("user1");

        Response response = authResource.me();

        assertEquals(200, response.getStatus());
        UserInfoDTO dto = (UserInfoDTO) response.getEntity();
        assertEquals("user1", dto.getUsername());
        assertEquals("user", dto.getRole());
    }

    @Test
    void me_authenticatedAdmin_returnsAdminRole() {
        when(accessControl.isUserSignedIn()).thenReturn(true);
        when(accessControl.isUserInRole("admin")).thenReturn(true);
        when(accessControl.getPrincipalName()).thenReturn("admin");

        Response response = authResource.me();

        assertEquals(200, response.getStatus());
        UserInfoDTO dto = (UserInfoDTO) response.getEntity();
        assertEquals("admin", dto.getUsername());
        assertEquals("admin", dto.getRole());
    }

    @Test
    void me_notAuthenticated_returns401() {
        when(accessControl.isUserSignedIn()).thenReturn(false);

        Response response = authResource.me();

        assertEquals(401, response.getStatus());
        String entity = (String) response.getEntity();
        assertNotNull(entity);
    }
}
