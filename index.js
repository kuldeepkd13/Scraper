const axios = require('axios');  // Importing axios for making HTTP requests
const cheerio = require('cheerio');  // Importing cheerio for parsing HTML
const fs = require('fs');  // Importing fs for file system operations
const zlib = require('zlib');  // Importing zlib for gzip compression

class Scraper {
    constructor(deliveryLocation) {
        this.deliveryLocation = deliveryLocation;  // Initializing delivery location
    }

    async fetchHTML(url) {
        try {
            const response = await axios.get(url);  // Fetching HTML content from URL using axios
            return response.data;  // Returning HTML content
        } catch (error) {
            console.error('Error fetching HTML:', error);  // Logging error if HTML fetch fails
            return null;  // Returning null if fetch fails
        }
    }

    async scrapeProductURLs() {
        const url = 'https://www.amazon.in/s?k=laptops';  // Amazon laptops search URL
        const html = await this.fetchHTML(url);  // Fetching HTML content

        if (!html) {
            console.error('Failed to fetch HTML. Exiting...');  // Logging error if HTML fetch fails
            return [];  // Returning empty array if fetch fails
        }

        const $ = cheerio.load(html);  // Loading HTML content into cheerio
        const productURLs = [];  // Initializing array to store product URLs

        // Extracting product URLs
        $('a.a-link-normal.a-text-normal').each((index, element) => {
            const productURL = $(element).attr('href');  // Extracting product URL
            if (productURL && productURL.startsWith('/')) {
                productURLs.push(`https://www.amazon.in${productURL}`);  // Adding absolute product URL to array
            }
        });

        return productURLs;  // Returning array of product URLs
    }

    async scrapeProductDetails(productURL) {
        const html = await this.fetchHTML(productURL);  // Fetching HTML content of product page

        if (!html) {
            console.error(`Failed to fetch HTML for product URL: ${productURL}. Skipping...`);  // Logging error if HTML fetch fails
            return null;  // Returning null if fetch fails
        }

        const $ = cheerio.load(html);  // Loading HTML content into cheerio

        // Setting delivery location (mocking behavior)
        $('#glow-ingress-line2').text(this.deliveryLocation);

        // Extracting product details
        const skuId = $('div[data-asin]').attr('data-asin');  // Extracting SKU ID
        const productName = $('span#productTitle').text().trim();  // Extracting product name
        const mrp = $("#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-small.aok-align-center > span > span.aok-relative > span > span > span.a-offscreen").text();  // Extracting MRP
        const sellingPrice = $("#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-none.aok-align-center > span.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay > span:nth-child(2) > span.a-price-whole").text();  // Extracting selling price
        const discount = $("#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-none.aok-align-center > span.a-size-large.a-color-price.savingPriceOverride.aok-align-center.reinventPriceSavingsPercentageMargin.savingsPercentage").text();  // Extracting discount
        const brandName = $("#productDetails_techSpec_section_1 > tbody > tr:nth-child(1) > td").text().trim();  // Extracting brand name
        const imageUrl = $("#landingImage").attr("src");  // Extracting image URL
        const deliveryDate = $("#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE > span > span").text();  // Extracting delivery date
        const description = $("#feature-bullets > ul > li:nth-child(1) > span").text().trim();  // Extracting description

        // Mapping extracted data to schema
        const productData = {
            skuId,
            productName,
            mrp,
            sellingPrice,
            discount,
            brandName,
            imageUrl,
            deliveryDate,
            description
        };
        console.log(productData);  // Logging product data
        return productData;  // Returning product data
    }

    async scrapeLaptops() {
        const productURLs = await this.scrapeProductURLs();  // Scraping product URLs
        const products = [];  // Initializing array to store product details

        for (const productURL of productURLs) {
            const productData = await this.scrapeProductDetails(productURL);  // Scraping product details
            if (productData) {
                products.push(productData);  // Adding product data to array if available
            }
        }

        this.writeDataToFile(products);  // Writing scraped data to a file
    }

    writeDataToFile(products) {
        const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/[TZ.]/g, '_');  // Generating timestamp for unique filename
        const filename = `products_${timestamp}.gz`;  // Creating unique filename with timestamp
        const ndjsonData = products.map(product => JSON.stringify(product)).join('\n');  // Converting products to NDJSON format
        const compressedData = zlib.gzipSync(ndjsonData);  // Compressing NDJSON data using gzip
        fs.writeFileSync(filename, compressedData);  // Writing compressed data to file
    }
}

function main() {
    const deliveryLocation = 'NewDelhi 110001';  // Setting delivery location
    const scraper = new Scraper(deliveryLocation);  // Creating Scraper instance
    scraper.scrapeLaptops();  // Initiating laptop scraping process
}

main();  // Calling main function to start scraping
