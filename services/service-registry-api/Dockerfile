# Multi-stage build for Service Registry API
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy pom.xml first for better caching
COPY pom.xml .

# Copy service-registry-api module
COPY services/service-registry-api/pom.xml services/service-registry-api/
COPY services/service-registry-api/src services/service-registry-api/src

# Build the project
RUN cd services/service-registry-api && mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy the built JAR
COPY --from=builder /build/services/service-registry-api/target/*.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]
