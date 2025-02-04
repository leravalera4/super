const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
require("dotenv").config();
const pLimit = require("p-limit");

const limit = pLimit(5); // Ограничиваем до 10 параллельных операций
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; 
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
//     ssl: {
//         rejectUnauthorized: false,
//         ca: `-----BEGIN CERTIFICATE-----
// MIIEQTCCAqmgAwIBAgIULMxAsTW1CKW9bTT26QYAIn1KcNowDQYJKoZIhvcNAQEM
// BQAwOjE4MDYGA1UEAwwvZjQ4NzRkZGEtNmYzYi00MDFlLWIzNGYtNDYxOTI2MzA1
// MzlkIFByb2plY3QgQ0EwHhcNMjUwMTE2MTc1OTU1WhcNMzUwMTE0MTc1OTU1WjA6
// MTgwNgYDVQQDDC9mNDg3NGRkYS02ZjNiLTQwMWUtYjM0Zi00NjE5MjYzMDUzOWQg
// UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAN47yD9d
// Pabi1XUGEfEpho/Z8UHwIkcoYjZmJR5+umxrBDwJKn6TX2YVLWXRFk5oTT/0vWQN
// lHAIZB/d4JRJWxpGSn5BfSGpmme/xczUtJte2Snm0gNTVJGp9+nSCkFV4wwek/Hk
// MIsQbDZ15fWK6DCHjU2QGJLXH/RT4/s8qlsJSQo0c1lRJT2tulTcjjVBo6F42T71
// KJCVSjfoGPYab6luGTeK+XytSaxBFH159+pn8c4WmR5fdRE4clhEsbieUHF6Wvy7
// n/7KxNRMhrF6DdgMiLyNQgX8UBZyCjB9l48vagsXvP9Vn2i/4FJrH8guyLxtf6bM
// UtYFC7RcwwlN8hdloOlSVkA//9cFBiTPAj+/ryzyZwi64BNNxSTjnxF4Eb5HGEPh
// ihjWJxwVTsWoXHSUCmELNWZK0tsNZ82TIGPi0a+Vek7CR8qNk6w7/knzNsOFqdFm
// VD7LiwlTMnj7+ustNSb+O7S1tMazQ+qpd1edJ3C0Zbz4dhrdZ7esfoQOLQIDAQAB
// oz8wPTAdBgNVHQ4EFgQUWh+9N2ljI4vYLJBQrB66/+S8IsowDwYDVR0TBAgwBgEB
// /wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAKWA0tIjLDRk0bQ2
// aBeU55i+TydDACqcwSIxQLM1yw93zwVZAqzCZy+jFmPzCNl4+5ciw3wJtJRIydGZ
// fCQ40YuvLRqiSoT1EYtd+QzTt4Ff5XwzffQRVPQAV4H9Fc4WaGIRP2HmnZ+E9kDr
// 5XAA3X9nU6O2jGEb+UjqDw8LxhCb3cwM9KOzp90PTAYQwCCJMpFohG9ML9ZwOtcs
// NTcEoAzhRkB85CYvwFdWUnmQPNLE9b9U1U9rn0yTFLFQYRVgp8yvQnyFJllV4KnO
// DBgABjb2fXsvbZ3UL5a/twe+AvPV9xjjxWqi0AO50ZhVVg35NBLnsoSjA+4ZUlEu
// qtrU5nPuv2uv3TskLMOxCPMwe5FBRsWGZiPPxWFhSC75VkLaIrG3lNoDv91U9hrJ
// h9AC5ckhkqi1eh1ovKdmU0bBPBJel9Gb0rfS2w1e3e25wLJEOmYhZYgLfwREHxvR
// 1DJ56CVcWeSQjd86Pd4tV3OU0qsCc5HvlakBDBt+b9c+WDsUHg==
// -----END CERTIFICATE-----`
//       }
  });

app.listen(3002, () => {
  console.log("Server started on port 3025");
});

async function startScraping() {
  const links = [
    "https://www.superstore.ca/store-locator/details/1581",
    "https://www.superstore.ca/store-locator/details/0570", //2
    "https://www.superstore.ca/store-locator/details/1503", //120
    "https://www.superstore.ca/store-locator/details/1510", //119
    "https://www.superstore.ca/store-locator/details/1525", //141
    "https://www.superstore.ca/store-locator/details/1530",
    "https://www.superstore.ca/store-locator/details/1531"
  ];

  const productLinks = [
    "https://www.superstore.ca/food/fruits-vegetables/fresh-vegetables/c/28195?sort=name-asc&page=1",
    "https://www.superstore.ca/food/fruits-vegetables/fresh-fruits/c/28194?sort=name-asc&page=1",
    "https://www.superstore.ca/food/fruits-vegetables/packaged-salad-dressing/c/28196?sort=name-asc&page=1",
    "https://www.superstore.ca/food/fruits-vegetables/herbs/c/28197?sort=name-asc&page=1",
    "https://www.superstore.ca/food/fruits-vegetables/fresh-cut-fruits-vegetables/c/28198?sort=name-asc&page=1",
    "https://www.superstore.ca/food/fruits-vegetables/dried-fruits-nuts/c/28199?sort=name-asc&page=1",
    "https://www.superstore.ca/food/fruits-vegetables/fresh-juice-smoothies/c/28200?sort=name-asc&page=1",

    "https://www.superstore.ca/food/dairy-eggs/butter-spreads/c/28220?sort=name-asc&page=1",
    "https://www.superstore.ca/food/dairy-eggs/desserts-doughs/c/28221?sort=name-asc&page=1",
    "https://www.superstore.ca/food/dairy-eggs/egg-egg-substitutes/c/28222?sort=name-asc&page=1",
    "https://www.superstore.ca/food/dairy-eggs/lactose-free/c/28223?sort=name-asc&page=1",
    "https://www.superstore.ca/food/dairy-eggs/milk-cream/c/28224?sort=name-asc&page=1",
    "https://www.superstore.ca/food/dairy-eggs/cheese/c/28225?sort=name-asc&page=1",
    "https://www.superstore.ca/food/dairy-eggs/sour-cream-dips/c/28226?sort=name-asc&page=1",
    "https://www.superstore.ca/food/dairy-eggs/yogurt/c/28227?sort=name-asc&page=1",
    "https://www.superstore.ca/food/dairy-eggs/non-dairy-milk-alternatives/c/58904?sort=name-asc&page=1",

    "https://www.superstore.ca/food/meat/chicken-turkey/c/28214?sort=name-asc&page=1",
    "https://www.superstore.ca/food/meat/game-meat-offals-fowl/c/28216?sort=name-asc&page=1",
    "https://www.superstore.ca/food/meat/lamb-veal/c/28171?sort=name-asc&page=1",
    "https://www.superstore.ca/food/meat/pork-ham/c/28215?sort=name-asc&page=1",
    "https://www.superstore.ca/food/meat/sausages/c/28170?sort=name-asc&page=1",
    "https://www.superstore.ca/food/meat/kebabs-marinated-meat/c/28173?sort=name-asc&page=1",
    "https://www.superstore.ca/food/meat/beef/c/28174?sort=name-asc&page=1",
    "https://www.nofrills.ca/food/meat/bacon/c/59252?sort=name-asc&page=1",

    "https://www.superstore.ca/food/pantry/honey-syrups-spreads/c/28184?sort=name-asc&page=1",
    "https://www.superstore.ca/food/pantry/spices-seasonings/c/28188?sort=name-asc&page=1",
    "https://www.superstore.ca/food/pantry/cereal-breakfast/c/28183?sort=name-asc&page=1",
    "https://www.superstore.ca/food/pantry/canned-pickled/c/28187",
    "https://www.superstore.ca/food/pantry/dried-beans-vegetables-grains/c/28185?sort=name-asc&page=1",
    "https://www.superstore.ca/food/pantry/baking-essentials/c/28186?sort=name-asc&page=1",
    "https://www.superstore.ca/food/pantry/condiments-sauces/c/28243?sort=name-asc&page=1",
    "https://www.superstore.ca/food/pantry/oils-vinegar/c/28244?sort=name-asc&page=1",
    "https://www.superstore.ca/food/pantry/international-foods/c/28245?sort=name-asc&page=1",
    "https://www.superstore.ca/food/pantry/easy-meals-sides/c/28246?sort=name-asc&page=1",
    "https://www.superstore.ca/food/pantry/pasta-pasta-sauce/c/28247?sort=name-asc&page=1",
    "https://www.superstore.ca/food/pantry/rice/c/28248?sort=name-asc&page=1",
    "https://www.superstore.ca/food/pantry/bulk-nuts-and-candy/c/57088?sort=name-asc&page=1",

    "https://www.superstore.ca/food/international-foods/south-asian-foods/c/58045?sort=name-asc&page=1",
    "https://www.superstore.ca/food/international-foods/east-asian-foods/c/58466?sort=name-asc&page=1",
    "https://www.superstore.ca/food/international-foods/halal-foods/c/58556?sort=name-asc&page=1",
    "https://www.superstore.ca/food/international-foods/latin-american-foods/c/58680?sort=name-asc&page=1",
    "https://www.superstore.ca/food/international-foods/european-foods/c/58801?sort=name-asc&page=1", //00 34 time
    "https://www.superstore.ca/food/international-foods/middle-eastern-foods/c/58561",
    "https://www.superstore.ca/food/international-foods/filipino-foods/c/58812?sort=name-asc&page=1",

    "https://www.superstore.ca/food/snacks-chips-candy/chips-snacks/c/28250?sort=name-asc&page=1",
    "https://www.superstore.ca/food/snacks-chips-candy/candy-chocolate/c/28249?sort=name-asc&page=1",
    "https://www.superstore.ca/food/snacks-chips-candy/crackers-cookies/c/28242?sort=name-asc&page=1",
    "https://www.superstore.ca/food/snacks-chips-candy/snack-cakes/c/59210?sort=name-asc&page=1",

    "https://www.superstore.ca/food/frozen-food/frozen-pizza/c/28165?sort=name-asc&page=1",
    "https://www.superstore.ca/food/frozen-food/meals-entrees-sides/c/28163?sort=name-asc&page=1",
    "https://www.superstore.ca/food/frozen-food/frozen-fruit-vegetables/c/28162?sort=name-asc&page=1",
    "https://www.superstore.ca/food/frozen-food/bakery-breakfast/c/28164?sort=name-asc&page=1",
    "https://www.superstore.ca/food/frozen-food/appetizers-snacks/c/28238?sort=name-asc&page=1",
    "https://www.superstore.ca/food/frozen-food/beverages-ice/c/28239?sort=name-asc&page=1",
    "https://www.superstore.ca/food/frozen-food/ice-cream-desserts/c/28240?sort=name-asc&page=1",
    "https://www.superstore.ca/food/frozen-food/meatless-alternatives/c/28241?sort=name-asc&page=1",
    "https://www.superstore.ca/food/frozen-food/frozen-meat-seafood/c/57003?sort=name-asc&page=1",

    "https://www.superstore.ca/food/natural-and-organic/dairy-and-eggs/c/59391?sort=name-asc&page=1",
    "https://www.superstore.ca/food/natural-and-organic/snacks-chips-candy/c/29714?sort=name-asc&page=1",
    "https://www.superstore.ca/food/natural-and-organic/frozen-foods/c/59302?sort=name-asc&page=1",
    "https://www.superstore.ca/food/natural-and-organic/drinks/c/29717?sort=name-asc&page=1",
    "https://www.superstore.ca/food/natural-and-organic/cereals-spreads-syrups/c/59260?sort=name-asc&page=1", //00 43
    "https://www.superstore.ca/food/natural-and-organic/pasta-and-side-dishes/c/29927?sort=name-asc&page=1",
    "https://www.superstore.ca/food/natural-and-organic/baking-and-spices/c/29924?sort=name-asc&page=1",
    "https://www.superstore.ca/food/natural-and-organic/canned/c/29925?sort=name-asc&page=1",
    "https://www.superstore.ca/food/natural-and-organic/condiments-sauces-and-oils/c/29713?sort=name-asc&page=1",
    "https://www.superstore.ca/food/natural-and-organic/bars-and-protein/c/59281?sort=name-asc&page=1",

    "https://www.superstore.ca/food/bakery/bread/c/28251?sort=name-asc&page=1",
    "https://www.superstore.ca/food/bakery/wraps-flatbread-pizza-crust/c/28150?sort=name-asc&page=1",
    "https://www.superstore.ca/food/bakery/buns-rolls/c/28147?sort=name-asc&page=1",
    "https://www.superstore.ca/food/bakery/bagels-croissants-english-muffins/c/28149?sort=name-asc&page=1",
    "https://www.superstore.ca/food/bakery/cookies-muffins-desserts/c/28148?sort=name-asc&page=1",
    "https://www.superstore.ca/food/bakery/cakes/c/59494?sort=name-asc&page=1",

    "https://www.superstore.ca/food/prepared-meals/rotisserie-fried-chicken/c/28166?sort=name-asc&page=1",
    "https://www.superstore.ca/food/prepared-meals/entrees-appetizers/c/28205?sort=name-asc&page=1",
    "https://www.superstore.ca/food/prepared-meals/pizza/c/28211?sort=name-asc&page=1",
    "https://www.superstore.ca/food/prepared-meals/salads-soups/c/28167?sort=name-asc&page=1",
    "https://www.superstore.ca/food/prepared-meals/fresh-pasta-sauce/c/28210?sort=name-asc&page=1",
    "https://www.superstore.ca/food/prepared-meals/quiches-pies/c/28206?sort=name-asc&page=1",
    "https://www.superstore.ca/food/prepared-meals/snacks-dips/c/57043?sort=name-asc&page=1",

    "https://www.superstore.ca/food/drinks/coffee/c/28228?sort=name-asc&page=1", // 12 22
    "https://www.superstore.ca/food/drinks/drink-mixes/c/28229?sort=name-asc&page=1",
    "https://www.superstore.ca/food/drinks/juice/c/28230?sort=name-asc&page=1",
    "https://www.superstore.ca/food/drinks/soft-drinks/c/28231?sort=name-asc&page=1",
    "https://www.superstore.ca/food/drinks/non-dairy-milk-alternatives/c/28232?sort=name-asc&page=1",
    "https://www.superstore.ca/food/drinks/sports-energy/c/28233?sort=name-asc&page=1",
    "https://www.superstore.ca/food/drinks/tea-hot-drinks/c/28234?sort=name-asc&page=1",
    "https://www.superstore.ca/food/drinks/water/c/28235?sort=name-asc&page=1",
    "https://www.superstore.ca/food/drinks/non-alcoholic-drinks/c/29718?sort=name-asc&page=1",

    "https://www.superstore.ca/food/deli/deli-meat/c/28201?sort=name-asc&page=1",
    "https://www.superstore.ca/food/deli/deli-cheese/c/28202?sort=name-asc&page=1",
    "https://www.superstore.ca/food/deli/party-trays/c/28212?sort=name-asc&page=1",
    "https://www.superstore.ca/food/deli/dips-spreads-antipasto/c/28203?sort=name-asc&page=1",
    "https://www.superstore.ca/food/deli/crackers-condiments/c/28158?sort=name-asc&page=1", //00 52
    "https://www.superstore.ca/food/deli/vegan-vegetarian/c/28204?sort=name-asc&page=1",
    "https://www.superstore.ca/food/deli/lunch-snack-kits/c/57039?sort=name-asc&page=1",

    "https://www.superstore.ca/food/fish-seafood/salmon/c/28217?sort=name-asc&page=1",
    "https://www.superstore.ca/food/fish-seafood/shrimp/c/28218?sort=name-asc&page=1",
    "https://www.superstore.ca/food/fish-seafood/seafood-appetizers/c/28192?sort=name-asc&page=1",
    "https://www.superstore.ca/food/fish-seafood/shellfish/c/28190?sort=name-asc&page=1",
    "https://www.superstore.ca/food/fish-seafood/smoked-fish/c/28219?sort=name-asc&page=1",
    "https://www.superstore.ca/food/fish-seafood/fish/c/28191?sort=name-asc&page=1",
    "https://www.superstore.ca/food/fish-seafood/squid-octopus/c/28193?sort=name-asc&page=1", //00 54
  ];

  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  // const page = await browser.newPage();
  try {
    const startTime = Date.now();
    // Обработка ссылок с ограничением
    await Promise.all(
      links.map((link) =>
        limit(async () => {
          const page = await browser.newPage();
          console.log(`Processing store link: ${link}`);
          try {
            await processStore(page, link, productLinks);
          } catch (error) {
            console.error(`Error processing link ${link}:`, error);
          } finally {
            await page.close();
          }
        })
      )
    );

    res.send("Scraping completed successfully.");
    console.log(`Total time: ${(Date.now() - startTime) / 1000}s`);
  } catch (error) {
    console.error("Error during scraping:", error);
    res.status(500).send("Error scraping website.");
  } finally {
    await browser.close();
  }
}

async function processStore(page, storeLink, productLinks) {
  try {
    console.log(`Navigating to store: ${storeLink}`);
    await page.goto(storeLink, { waitUntil: "networkidle0", timeout: 60000 });

    //const storeID = page.url().split("/").pop();
    console.log(page.url()); // Для проверки правильности URL
    const storeID = page.url().replace(/\/$/, "").split("/").pop();
    console.log(storeID);
    try {
      // Ожидаем появления кнопки баннера cookie
      const button = await page.waitForSelector(
        "#onetrust-accept-btn-handler",
        { timeout: 5000 }
      );

      if (button) {
        // Если кнопка есть, кликаем на неё и ждем, чтобы баннер исчез
        await button.click();
        console.log("Cookie banner closed.");
        await page.waitForTimeout(1000); // Небольшая пауза, чтобы убедиться, что баннер исчез
      }
    } catch (error) {
      // Если кнопка не найдена, просто продолжаем выполнение
      console.log("Cookie banner not found or already closed, continuing...");
    }

    const setStoreButton = await page.$(
      ".location-pickup-confirmation__actions__set-store"
    );

    if (setStoreButton) {
      await setStoreButton.click();
      await page.waitForTimeout(10000);
      console.log("BUTTON FOUND FOR STORE:", storeID);
    } else {
      console.warn("Set Store button not found for store:", storeID);
    }

    for (const productLink of productLinks) {
      console.log(`Scraping product link: ${productLink}`);
      await scrapeProductPage(page, productLink, storeID);
    }
    console.log(`Finished processing store: ${storeID}`);
  } catch (error) {
    console.error(`Error processing store ${storeLink}:`, error);
  }
}

async function scrapeProductPage(page, productLink, storeID) {
  await page.goto(productLink, { waitUntil: "networkidle0", timeout: 60000 });

  let category;
  try {
    await page.waitForSelector(".chakra-link.css-kho608", { timeout: 15000 });
    const elements = await page.$$eval(".chakra-link.css-kho608", (links) =>
      links.map((link) => link.textContent.trim())
    );
    category = elements[1];
    console.log("CATEGORY", category);
  } catch (error) {
    console.error(`Selector not found on page: ${productLink}`, error);
    category = "Unknown Category";
  }

  await page.waitForTimeout(2000);

  while (true) {
    const productHandles = await page.$$(".chakra-linkbox.css-yxqevf");
    await Promise.all(
      productHandles.map((handle) =>
        extractAndSaveProductData(handle, storeID, category)
      )
    );
    const nextButton = await page.$('a.chakra-link[aria-label="Next Page"]');
    if (!nextButton) break;
    const nextUrl = await nextButton.evaluate((el) => el.href); // Получаем ссылку из кнопки
    console.log("Next Page URL:", nextUrl); // Показываем ссылку
    await nextButton.click();
    await page.waitForTimeout(2000);
  }
}

async function extractAndSaveProductData(handle, storeID, category) {
  const productData = await extractProductData(handle, storeID, category);
  await saveProductData(productData);
}

async function extractProductData(handle, storeID, category) {
  const extract = async (selector) => {
    try {
      return await handle.$eval(
        `p.chakra-text[data-testid="${selector}"]`,
        (el) => el.textContent.trim()
      );
    } catch {
      return null;
    }
  };

  const extractPrice = async (selector) => {
    try {
      const price = await handle.$eval(
        `span.chakra-text[data-testid="${selector}"]`,
        (el) => el.textContent.trim()
      );
      return price.match(/\$\d+(\.\d+)?/)?.[0] || null;
    } catch {
      return null;
    }
  };

  const data = {
    storeID,
    category,
    productID: await handle.$eval(
      'h3.chakra-heading[data-testid="product-title"]',
      (el) => el.id
    ),
    title: await handle.$eval(".chakra-heading", (name) =>
      name.textContent.trim()
    ),
    regPrice: await extractPrice("regular-price"),
    salePrice: await extractPrice("sale-price"),
    wasPrice: await extractPrice("was-price"),
    sale: await extract("price-descriptor"),
    image: await handle.$eval(
      'div[data-testid="product-image"] img',
      (img) => img.src
    ),
    stock: await extract("inventory-badge-text"),
    brand: await extract("product-brand"),
    weight: await extract("product-package-size"),
        last_update: '2025-02-05',
    //last_update: new Date().toISOString().split("T")[0],
    storetype: "Superstore",
    nonMemberPrice: await extractPrice("non-members-price"),
  };

  return data;
}

async function saveProductData(product) {
  const client = await pool.connect();
  const products = [product]; // Если работаете с одним продуктом
  try {
    // await client.query('SET default_transaction_read_only = OFF');
    // Начинаем транзакцию
    await client.query("BEGIN");
    const insertQuery = `
    INSERT INTO nofrills (
      "storeID", category, "productID", title, brand, regPrice, salePrice, wasPrice, sale, image, stock, weight, last_update, storetype, member_price, non_member_price, tsv_title_brand
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 
      to_tsvector('english', $4 || ' ' || COALESCE($5, 'unknown'))
    )
    ON CONFLICT ("storeID", "productID") DO UPDATE
    SET 
      title = EXCLUDED.title,
      brand = EXCLUDED.brand,
      category = EXCLUDED.category,
      regPrice = EXCLUDED.regPrice,
      salePrice = EXCLUDED.salePrice,
      wasPrice = EXCLUDED.wasPrice,
      sale = EXCLUDED.sale,
      image = EXCLUDED.image,
      stock = EXCLUDED.stock,
      weight = EXCLUDED.weight,
      last_update = EXCLUDED.last_update,
      non_member_price = EXCLUDED.non_member_price,
      tsv_title_brand = EXCLUDED.tsv_title_brand;
  `;

    const values = products.flatMap((p) => [
      p.storeID,
      p.category,
      p.productID,
      p.title,
      p.brand,
      p.regPrice || null,
      p.salePrice || null,
      p.wasPrice || null,
      p.sale,
      p.image,
      p.stock,
      p.weight,
      p.last_update,
      p.storetype,
      p.memberPrice,
      p.nonMemberPrice,
    ]);
    // Выполняем запрос
    await client.query(insertQuery, values);

    // Коммитим транзакцию
    await client.query("COMMIT");

    console.log(`${product.storeID} ${product.productID}`);
  } catch (error) {
    // Откатываем транзакцию в случае ошибки
    await client.query("ROLLBACK");

    // Логируем ошибку и данные, которые не удалось сохранить
    console.error("Error saving product data:", error);
    console.error("Failed product data:", product);

    // Здесь вы можете добавить дополнительные уведомления или логирование, например, в файл или систему мониторинга
  } finally {
    // Освобождаем клиентское соединение
    client.release();
  }
}

startScraping();








