# Web Scraper Documentation Report

## 1. Introduction:
This project aims to develop a web scraper to extract specific information from the Amazon-IN website, particularly laptops, and their details. The scraper is implemented in JavaScript using Node.js runtime environment, and it utilizes Cheerio for HTML parsing and Axios for making HTTP requests.

## 2. Project Structure:
The project consists of a single JavaScript file named `index.js`, which contains all the scraping logic.

## 3. Dependencies:
- axios: For making HTTP requests.
- cheerio: For parsing HTML.
- fs: For file system operations.
- zlib: For gzip compression.


## 4. How to Run:
To run the scraper, execute the following command in the terminal: `node index.js`.

## 5. Functionality:
The scraper first fetches the search results page of Amazon-IN for laptops and extracts the URLs of individual product pages. It then visits each product page to extract details such as SKU ID, product name, price, brand, delivery information, etc. The extracted data is then organized and written to a gzip compressed NDJSON file. Each file is uniquely named with a timestamp in the format `products_<timestamp>.gz`, where `<timestamp>` represents the current date and time in UTC format. This ensures that each run of the scraper generates a new and unique file containing structured data in NDJSON format, making it easy to parse and analyze the scraped information programmatically.


## 6. Error Handling:
The scraper handles errors gracefully by logging error messages to the console and skipping over any failed operations. For example, if fetching HTML for a product page fails, the scraper logs an error message and continues to the next product.

## 7. Future Improvements:
Future improvements to the scraper could include adding support for additional product categories, optimizing performance for larger datasets, or enhancing error handling and logging.

## 8. Conclusion:
In conclusion, this web scraper provides a robust solution for extracting laptop data from Amazon-IN, demonstrating the power and flexibility of web scraping techniques.

## 9. References:
- Node.js Documentation: https://nodejs.org/en/docs/
- Cheerio Documentation: https://cheerio.js.org/
- Axios Documentation: https://axios-http.com/docs/intro
