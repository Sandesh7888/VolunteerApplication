# Stage 1: Build the application
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY . .

RUN if [ -f backend/pom.xml ]; then \
        cd backend && \
        mvn clean package -DskipTests && \
        cp target/vms-backend-*.jar /app/app.jar; \
    else \
        mvn clean package -DskipTests && \
        cp target/vms-backend-*.jar /app/app.jar; \
    fi

# Stage 2: Run the application
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/app.jar /app/app.jar

EXPOSE 8080

CMD ["java", "-jar", "/app/app.jar"]
