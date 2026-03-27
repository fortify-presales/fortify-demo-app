# Multi-stage Dockerfile for building and running the Spring Boot application
# Build stage: use Gradle image to build the fat/boot jar
FROM node:18-alpine AS frontend
WORKDIR /frontend
# Install frontend deps and build (uses frontend/package.json)
COPY frontend/package*.json frontend/package-lock*.json ./
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build

FROM gradle:8.2-jdk17 AS build
WORKDIR /home/gradle/project

# Copy project files
COPY --chown=gradle:gradle . ./

# Copy built frontend artifacts into the Spring Boot static resources so
# the resulting fat jar includes the SPA. This uses the frontend stage's output.
COPY --from=frontend /frontend/dist src/main/resources/static

# Run the Gradle build (skip tests to speed up container builds)
# Pick the largest JAR produced (to prefer the fat/boot jar) and copy it
RUN gradle bootJar --no-daemon -x test && cp $(ls -S build/libs/*.jar | head -n1) /tmp/app.jar

# Runtime stage: use a slim Java runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Do not include real secrets in images. This repo is intentionally insecure for testing.
COPY --from=build /tmp/app.jar ./app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

