<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Vault Voice Whistleblower Platform Backend

This repository contains the secure, Java Spring Boot application that manages all data persistence and API logic for the Vault Voice platform.

## Run Locally

**Prerequisites:** Java 17+ (JDK 21 Recommended), MySQL Server, Maven

1.  **Configure Database:**
    * Ensure your **MySQL Server** is running.
    * Update the database connection details in `src/main/resources/application.properties`.

    ```properties
    # .env equivalent for backend database connection
    spring.datasource.url=jdbc:mysql://localhost:3306/vaultvoice_db
    spring.datasource.username=root
    spring.datasource.password=your_mysql_password
    ```

2.  **Build Dependencies:**
    * Use Maven to download all required libraries (Spring Boot, JPA, Security, JJWT).

    ```bash
    mvn clean install
    ```

3.  **Run the Backend:**
    * Start the Spring Boot application.

    ```bash
    mvn spring-boot:run
    ```

The application will be accessible at **`http://localhost:8080`** (or configured port), providing RESTful APIs for the frontend.

## Key Endpoints

| User Flow | Endpoint Prefix | Purpose |
| :--- | :--- | :--- |
| **Investigator Portal** | `/api/investigator/` | Requires **JWT** authentication. Handles case viewing, status updates, and replies. |
| **Whistleblower Follow-Up** | `/api/followup/` | Requires `sessionId` and `passphrase`. Handles secure, anonymous login and replies. |
