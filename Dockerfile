# Multi-stage Dockerfile for building and running the Spring Boot application
# Build stage: use Gradle image to build the fat/boot jar
FROM gradle:8.2-jdk17 AS build
WORKDIR /home/gradle/project

# Copy project files and run the build (skip tests to speed up container builds)
COPY --chown=gradle:gradle . ./
RUN gradle bootJar --no-daemon -x test && cp build/libs/*.jar /tmp/app.jar

# Runtime stage: use a slim Java runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Do not include real secrets in images. This repo is intentionally insecure for testing.
COPY --from=build /tmp/app.jar ./app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

