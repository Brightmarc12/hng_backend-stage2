# Backend Task: Country Currency & Exchange API

This project is a RESTful API built with Node.js, Express, and Sequelize. It fetches country and currency exchange data from external sources, processes and enriches this data, caches it in a MySQL database, and provides a suite of endpoints for CRUD operations and data retrieval. Additionally, it generates a dynamic summary image of the cached data.

---

### Key Features

-   **Data Aggregation:** Fetches data from two separate external APIs ([RestCountries](https://restcountries.com/) and [ExchangeRate-API](https://www.exchangerate-api.com/)).
-   **Data Caching:** Stores and manages the aggregated data in a MySQL database to ensure high performance and reliability.
-   **Dynamic Computation:** Calculates an `estimated_gdp` for each country based on population and real-time exchange rates.
-   **RESTful Endpoints:** Provides full CRUD (Create, Read, Delete) functionality for the cached country data.
-   **Filtering & Sorting:** The main `GET /countries` endpoint supports filtering by region and currency, as well as sorting by GDP.
-   **Dynamic Image Generation:** Creates and serves a PNG summary image displaying key statistics from the database.
-   **Robust Error Handling:** Implements proper error handling for external API failures, database issues, and invalid client requests.

---

### Technology Stack

-   **Backend:** Node.js, Express.js
-   **Database:** MySQL
-   **ORM:** Sequelize
-   **HTTP Client:** Axios
-   **Image Generation:** Sharp
-   **Environment Variables:** Dotenv

---

### API Documentation

The base URL for the API is `/api`.

#### 1. Refresh Country Data
-   **Method:** `POST`
-   **Endpoint:** `/countries/refresh`
-   **Description:** Fetches the latest data from the external APIs, updates the database cache, and generates a new summary image.
-   **Success Response (200 OK):**
    ```json
    {
      "message": "Country data refreshed and cached successfully. Image generation started.",
      "countries_processed": 250
    }
    ```
-   **Error Response (503 Service Unavailable):**
    ```json
    {
      "error": "External data source unavailable",
      "details": "Could not fetch data from RestCountries"
    }
    ```

#### 2. Get All Countries
-   **Method:** `GET`
-   **Endpoint:** `/countries`
-   **Description:** Retrieves a list of all countries from the database. Supports optional query parameters for filtering and sorting.
-   **Query Parameters:**
    -   `region` (e.g., `?region=Africa`)
    -   `currency` (e.g., `?currency=USD`)
    -   `sort` (e.g., `?sort=gdp_desc`)
-   **Success Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "name": "Nigeria",
        "capital": "Abuja",
        "region": "Africa",
        /* ... other fields */
      }
    ]
    ```

#### 3. Get a Single Country
-   **Method:** `GET`
-   **Endpoint:** `/countries/:name`
-   **Description:** Retrieves a single country by its name (case-insensitive).
-   **Success Response (200 OK):**
    ```json
    {
      "id": 1,
      "name": "Nigeria",
      /* ... other fields */
    }
    ```
-   **Error Response (404 Not Found):**
    ```json
    { "error": "Country not found" }
    ```

#### 4. Delete a Country
-   **Method:** `DELETE`
-   **Endpoint:** `/countries/:name`
-   **Description:** Deletes a country record from the database by its name.
-   **Success Response:** `204 No Content`
-   **Error Response (404 Not Found):**
    ```json
    { "error": "Country not found" }
    ```

#### 5. Get API Status
-   **Method:** `GET`
-   **Endpoint:** `/status`
-   **Description:** Returns the total number of countries in the database and the timestamp of the last successful refresh.
-   **Success Response (200 OK):**
    ```json
    {
      "total_countries": 250,
      "last_refreshed_at": "2025-10-25T12:00:00.000Z"
    }
    ```

#### 6. Get Summary Image
-   **Method:** `GET`
-   **Endpoint:** `/countries/image`
-   **Description:** Serves the `summary.png` image generated during the last refresh.
-   **Success Response:** A `image/png` file.
-   **Error Response (404 Not Found):**
    ```json
    {
      "error": "Summary image not found. Please run a refresh first."
    }
    ```

---

### How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd backend-stage2
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your MySQL database:**
    -   Create a new MySQL database.

4.  **Create a `.env` file** in the root directory and populate it with your database credentials. Use the `.env.example` file as a template:
    ```
    DB_HOST=your_database_host
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_NAME=your_database_name
    PORT=3000
    ```

5.  **Start the server:**
    ```bash
    node index.js
    ```
    The API will be available at `http://localhost:3000`.

---

### Environment Variables

The following environment variables are required for the application to run:

| Variable      | Description                               |
|---------------|-------------------------------------------|
| `DB_HOST`     | The hostname of the MySQL database.       |
| `DB_USER`     | The username for the database connection. |
| `DB_PASSWORD` | The password for the database connection. |
| `DB_NAME`     | The name of the database.                 |
| `PORT`        | The port on which the server will run.    |