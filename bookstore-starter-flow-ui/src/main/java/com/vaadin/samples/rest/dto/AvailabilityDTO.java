package com.vaadin.samples.rest.dto;

import com.vaadin.samples.backend.data.Availability;

public enum AvailabilityDTO {
    COMING,
    AVAILABLE,
    DISCONTINUED;

    public static AvailabilityDTO fromEntity(Availability availability) {
        if (availability == null) {
            return null;
        }
        return switch (availability) {
            case COMING -> COMING;
            case AVAILABLE -> AVAILABLE;
            case DISCONTINUED -> DISCONTINUED;
        };
    }
}
