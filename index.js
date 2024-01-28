const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs')
// Function to fetch HTML content of a webpage
async function fetchHTML(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching HTML:', error);
        return null;
    }
}

// Function to scrape product URLs from the search results page
async function scrapeProductURLs() {
    const url = 'https://www.amazon.in/s?k=laptops';
    const html = await fetchHTML(url);

    if (!html) {
        console.error('Failed to fetch HTML. Exiting...');
        return [];
    }

    const $ = cheerio.load(html);
    const productURLs = [];

    // Extract product URLs
    $('a.a-link-normal.a-text-normal').each((index, element) => {
        const productURL = $(element).attr('href');
        if (productURL && productURL.startsWith('/')) {
            productURLs.push(`https://www.amazon.in${productURL}`);
        }
    });

    return productURLs;
}

// Function to scrape product details from an individual product page
async function scrapeProductDetails(productURL, deliveryLocation) {
    const html = await fetchHTML(productURL);

    if (!html) {
        console.error(`Failed to fetch HTML for product URL: ${productURL}. Skipping...`);
        return null;
    }

    const $ = cheerio.load(html);

    // Set the delivery location (mocking behavior)
    $('#glow-ingress-line2').text(deliveryLocation);

    // Extract product details
    const skuId = $('div[data-asin]').attr('data-asin');
    const productName = $('span#productTitle').text().trim();
    const mrp = $("#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-small.aok-align-center > span > span.aok-relative > span > span > span.a-offscreen").text();
    const sellingPrice = $("#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-none.aok-align-center > span.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay > span:nth-child(2) > span.a-price-whole").text();
    const discount = $("#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-none.aok-align-center > span.a-size-large.a-color-price.savingPriceOverride.aok-align-center.reinventPriceSavingsPercentageMargin.savingsPercentage").text();
    
    const brandName = $("#productDetails_techSpec_section_1 > tbody > tr:nth-child(1) > td").text().trim()
    const imageUrl = $("#landingImage").attr("src");
    const  deliveryDate = $("#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE > span > span").text()
    const description = $("#feature-bullets > ul > li:nth-child(1) > span").text().trim()
    // Extract other details...

    // Map extracted data to schema
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
        // Map other fields...
    };

    // Log or process the product data
    console.log('Product Data:', productData);

    // here i want to create of product.json file and write the product data in json formet
    
    const fileName = 'product.json';
    fs.appendFile(fileName, JSON.stringify(productData, null, 2) + '\n', err => {
        if (err) {
            console.error('Error appending to file:', err);
        } else {
            console.log(`Product data appended to ${fileName}`);
        }
    });
    return productData;
}

// Main function to scrape laptop data
async function scrapeLaptops(deliveryLocation) {
    const productURLs = await scrapeProductURLs();

    for (const productURL of productURLs) {
        await scrapeProductDetails(productURL, deliveryLocation);
    }
}

// Call the main scraping function with the delivery location parameter
const deliveryLocation = 'NewDelhi 110001';
scrapeLaptops(deliveryLocation);
