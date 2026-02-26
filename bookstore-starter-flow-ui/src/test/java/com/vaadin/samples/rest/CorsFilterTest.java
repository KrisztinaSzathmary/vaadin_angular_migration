package com.vaadin.samples.rest;

import java.io.IOException;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.core.MultivaluedHashMap;
import jakarta.ws.rs.core.MultivaluedMap;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CorsFilterTest {

    private CorsFilter corsFilter;

    @Mock
    private ContainerRequestContext requestContext;

    @Mock
    private ContainerResponseContext responseContext;

    @BeforeEach
    void setUp() {
        corsFilter = new CorsFilter();
    }

    @Test
    void requestFilter_optionsPreflight_abortsWithCorsHeaders() throws IOException {
        when(requestContext.getMethod()).thenReturn("OPTIONS");

        corsFilter.filter(requestContext);

        ArgumentCaptor<jakarta.ws.rs.core.Response> captor =
                ArgumentCaptor.forClass(jakarta.ws.rs.core.Response.class);
        verify(requestContext).abortWith(captor.capture());

        jakarta.ws.rs.core.Response response = captor.getValue();
        assertEquals(200, response.getStatus());
        assertEquals("http://localhost:4200",
                response.getHeaderString("Access-Control-Allow-Origin"));
        assertEquals("true",
                response.getHeaderString("Access-Control-Allow-Credentials"));
        assertNotNull(response.getHeaderString("Access-Control-Allow-Methods"));
        assertNotNull(response.getHeaderString("Access-Control-Allow-Headers"));
        assertEquals("1209600",
                response.getHeaderString("Access-Control-Max-Age"));
    }

    @Test
    void requestFilter_getNonPreflight_doesNotAbort() throws IOException {
        when(requestContext.getMethod()).thenReturn("GET");

        corsFilter.filter(requestContext);

        verify(requestContext, never()).abortWith(any());
    }

    @Test
    void responseFilter_setsCorsHeaders() throws IOException {
        MultivaluedMap<String, Object> headers = new MultivaluedHashMap<>();
        when(responseContext.getHeaders()).thenReturn(headers);

        corsFilter.filter(requestContext, responseContext);

        assertEquals("http://localhost:4200", headers.getFirst("Access-Control-Allow-Origin"));
        assertEquals("true", headers.getFirst("Access-Control-Allow-Credentials"));
        assertNotNull(headers.getFirst("Access-Control-Allow-Methods"));
        assertNotNull(headers.getFirst("Access-Control-Allow-Headers"));
        assertEquals("1209600", headers.getFirst("Access-Control-Max-Age"));
    }
}
