FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY . .

RUN if [ -f backend/mvnw ]; then \
        chmod +x backend/mvnw && \
        cd backend && \
        ./mvnw clean package -DskipTests && \
        cp target/vms-backend-*.jar /app/app.jar; \
    else \
        chmod +x mvnw && \
        ./mvnw clean package -DskipTests && \
        cp target/vms-backend-*.jar /app/app.jar; \
    fi

EXPOSE 8080

CMD ["java", "-jar", "/app/app.jar"]
