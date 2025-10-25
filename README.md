# Backend Task: Country Currency & Exchange API

This project is a RESTful API built with Node.js, Express, and Sequelize. It fetches country and currency exchange data from external sources, processes and enriches it, caches it in a MySQL database, and provides a full suite of CRUD endpoints to interact with the data. The API also includes a feature to dynamically generate a summary image of the cached data.

## Features

- **Data Aggregation**: Fetches data from two separate external APIs (`restcountries.com` and `open.er-api.com`).
- **Data Caching**: Persists the processed data in a MySQL database to ensure high performance and avoid reliance on external services for every request.
- **Dynamic GDP Calculation**: Computes an estimated GDP for each country based on population, a random multiplier, and the latest exchange rates.
- **CRUD Operations**: Full support for Creating (refreshing), Reading, and Deleting country records.
- **Filtering & Sorting**: The main `GET /countries` endpoint supports filtering by region and currency, as well as sorting by GDP.
- **Dynamic Image Generation**: Automatically generates and serves a PNG summary image of the key database statistics upon a successful data refresh.
- **Robust Error Handling**: Implements proper error handling for external API failures, database issues, and invalid client requests.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **HTTP Client**: Axios
- **Image Generation**: Sharp

---

## API Endpoints

All endpoints are prefixed with `/api`.

### 1. Refresh Country Data

- **Endpoint**: `POST /countries/refresh`
- **Description**: Triggers a full data refresh. It fetches the latest data from the external APIs, calculates new GDPs, and updates the local database cache. This process can take a few seconds.
- **Success Response**:
  - **Code**: `200 OK`
  - **Body**:
    ```json
    {
      "message": "Country data refreshed and cached successfully. Image generation started.",
      "countries_processed": 250
    }
    ```
- **Error Response**:
  - **Code**: `503 Service Unavailable`
  - **Body**:
    ```json
    {
      "error": "External data source unavailable",
      "details": "Could not fetch data from RestCountries"
    }
    ```

### 2. Get All Countries

- **Endpoint**: `GET /countries`
- **Description**: Retrieves a list of all countries from the local database.
- **Query Parameters**:
  - `region=<string>`: Filters countries by region (e.g., `?region=Africa`).
  - `currency=<string>`: Filters countries by currency code (e.g., `?currency=NGN`).
  - `sort=<string>`: Sorts the results. Currently supports `gdp_desc` or `gdp_asc`.
- **Success Response**:
  - **Code**: `200 OK`
  - **Body**: `[ { ...country_object_1 }, { ...country_object_2 } ]`

### 3. Get a Single Country

- **Endpoint**: `GET /countries/:name`
- **Description**: Retrieves a single country by its name.
- **Success Response**:
  - **Code**: `200 OK`
  - **Body**: `{ ...country_object }`
- **Error Response**:
  - **Code**: `404 Not Found`
  - **Body**: `{ "error": "Country not found" }`

### 4. Delete a Country

- **Endpoint**: `DELETE /countries/:name`
- **Description**: Deletes a country record from the database by its name.
- **Success Response**:
  - **Code**: `204 No Content`

### 5. Get API Status

- **Endpoint**: `GET /status`
- **Description**: Provides metadata about the database cache.
- **Success Response**:
  - **Code**: `200 OK`
  - **Body**:
    ```json
    {
      "total_countries": 250,
      "last_refreshed_at": "2025-10-25T12:00:00.000Z"
    }
    ```

### 6. Get Summary Image

- **Endpoint**: `GET /countries/image`
- **Description**: Serves the `summary.png` image that was generated during the last successful refresh.
- **Success Response**:
  - **Code**: `200 OK`
  - **Body**: The PNG image file.
- **Error Response**:
  - **Code**: `404 Not Found`
  - **Body**: `{ "error": "Summary image not found. Please run a refresh first." }`

---

## Local Setup & Installation

### Prerequisites

- Node.js (v16 or higher)
- A running MySQL instance

### Steps

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd backend-stage2
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and copy the contents of `.env.example` (or the block below).

    ```
    # Database Configuration
    DB_HOST=your_database_host
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_NAME=your_database_name

    # Server Configuration
    PORT=3000
    ```
    Replace the placeholder values with your actual MySQL database credentials.

4.  **Run the application:**
    ```bash
    node index.js
    ```
    The server will start, connect to the database, and synchronize the models.

5.  **Populate the database:**
    Make a `POST` request to `http://localhost:3000/api/countries/refresh` using an API client like Postman or curl.