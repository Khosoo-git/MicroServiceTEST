package com.registry.serviceregistryapi;

public class ServiceAlreadyExistsException extends RuntimeException {

    public ServiceAlreadyExistsException(String serviceName) {
        super("Service with name '" + serviceName + "' already exists. Delete it first or use a different name.");
    }
}
