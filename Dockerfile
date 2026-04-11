FROM node:20-alpine AS frontend-build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM maven:3.9.9-eclipse-temurin-21 AS backend-build
WORKDIR /app

COPY backend ./backend

# Copy the Vite build output into Spring Boot static resources so the backend can serve the SPA.
RUN mkdir -p /app/backend/src/main/resources/static
COPY --from=frontend-build /app/dist /app/backend/src/main/resources/static

WORKDIR /app/backend
RUN mvn -B -DskipTests package


FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar /app/app.jar

ENV PORT=8080
EXPOSE 8080

CMD ["java", "-jar", "/app/app.jar"]
