# Backend Task: Country Currency & Exchange API

This project is a RESTful API built with Node.js, Express, and Sequelize. It fetches country and currency exchange data from external sources, processes and enriches this data, caches it in a MySQL database, and provides a suite of endpoints for CRUD operations and data retrieval. Additionally, it generates a dynamic summary image of the cached data.

This application is designed to be containerized with Docker to ensure a consistent and reliable runtime environment with all necessary system dependencies.

---

### Key Features

-   **Data Aggregation:** Fetches data from two separate external APIs ([RestCountries](https://restcountries.com/) and [ExchangeRate-API](https://www.exchangerate-api.com/)).
-   **Data Caching:** Stores and manages the aggregated data in a MySQL database to ensure high performance and reliability.
-   **Dynamic Computation:** Calculates an `estimated_gdp` for each country based on population and real-time exchange rates.
-   **RESTful Endpoints:** Provides full CRUD (Create, Read, Delete) functionality for the cached country data.
-   **Filtering & Sorting:** The main `GET /countries` endpoint supports filtering by region and currency, as well as sorting by GDP.
-   **Dynamic Image Generation:** Creates and serves a PNG summary image displaying key statistics from the database, with proper font rendering handled by system libraries within the Docker container.
-   **Robust Error Handling:** Implements proper error handling for external API failures, database issues, and invalid client requests.

---

### Technology Stack

-   **Backend:** Node.js, Express.js
-   **Database:** MySQL
-   **ORM:** Sequelize
-   **Containerization:** Docker
-   **HTTP Client:** Axios
-   **Image Generation:** Sharp

---

### API Documentation

The base URL for the API is `/api`.

*(The API Documentation section remains the same as before, as the endpoints have not changed.)*

#### 1. Refresh Country Data
-   **Method:** `POST`
-   **Endpoint:** `/countries/refresh`
-   ...

#### 2. Get All Countries
-   **Method:** `GET`
-   **Endpoint:** `/countries`
-   ...

#### 3. Get a Single Country
-   **Method:** `GET`
-   **Endpoint:** `/countries/:name`
-   ...

#### 4. Delete a Country
-   **Method:** `DELETE`
-   **Endpoint:** `/countries/:name`
-   ...

#### 5. Get API Status
-   **Method:** `GET`
-   **Endpoint:** `/status`
-   ...

#### 6. Get Summary Image
-   **Method:** `GET`
-   **Endpoint:** `/countries/image`
-   ...

---

### How to Run Locally

There are two methods to run this project locally. Using Docker is recommended as it perfectly replicates the production environment.

#### Method 1: Using Docker (Recommended)

**Prerequisites:** Docker must be installed and running on your machine.

1.  **Clone the repository.**

2.  **Set up your MySQL database.** You can use a local MySQL server or a Dockerized one.

3.  **Create a `.env` file** in the root directory. Populate it with your database credentials:
    ```
    # If using a local MySQL server on the host machine
    DB_HOST=host.docker.internal 
    DB_USER=your_user
    DB_PASSWORD=your_password
    DB_NAME=your_db_name
    DB_PORT=3306

    # If using a Dockerized MySQL, use the service name as the host
    # DB_HOST=mysql-container-name 
    ```

4.  **Build the Docker image:**
    ```bash
    docker build -t country-api .
    ```

5.  **Run the Docker container:**
    ```bash
    docker run -p 3000:8080 --env-file .env country-api
    ```
    The API will be available at `http://localhost:3000`.

#### Method 2: Using Node.js Directly

This method is simpler for quick testing but may not render the summary image correctly if you don't have the required font libraries installed on your local machine.

1.  **Clone the repository.**

2.  **Install Node.js** (v18 or higher recommended).

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Set up your MySQL database.**

5.  **Create a `.env` file** and populate it with your database credentials.

6.  **Start the server:**
    ```bash
    node index.js
    ```
    The API will be available at `http://localhost:3000`.

---

### Deployment

This application is configured for deployment using the provided `Dockerfile`. The Dockerfile sets up a Node.js environment and crucially installs `fontconfig` and other system-level libraries required by the `sharp` package for reliable SVG-to-PNG conversion.

Platforms like **Railway** can be configured to build directly from this `Dockerfile`, ensuring the production environment is identical to the one specified in the build instructions.