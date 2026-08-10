# Stage 1: Build Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run Spring Boot App
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/mentor-matrix-1.0.0.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]
