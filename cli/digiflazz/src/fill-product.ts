import { and, db, eq, inArray } from "@repo/db";
import {
  ProductBillingType,
  ProductFullfillmentType,
  ProductProvider,
  tb,
} from "@repo/db/types";
import "dotenv/config";
import { DigiFlazzService } from "./service";
import type { DigiFlazzProduct } from "./type";

const DB_PRODUCT_CATEGORY_ID = "065a90e4-8993-4fab-9c04-65bf431c26b4";
const DB_PRODUCT_SUB_CATEGORY_ID = "cfbd3e2b-2bcf-4ef7-a923-3f9ea605ff42";

const DF_PRODUCT_CATEGORY = "Games";
const DF_PRODUCT_BRAND = "Magic Chess";
const DF_PRODUCT_TYPE = ["Umum", "Membership"];

const DF_REPLACE_PRODUCT_TITLE = [
  DF_PRODUCT_BRAND,
  "-",
  "MOBILELEGENDS",
  "MOBILELEGEND",
  "Go Go",
];

// Global profit configuration
const PROFIT_PERCENTAGE = 1; // 1%
const MIN_PROFIT = 100;
const MAX_PROFIT = 1500;

const PLACEHOLDER_IMAGE =
  "https://shop.ldrescdn.com/rms/ld-space/process/img/19b48fda62784e24bf9abdfa7a8d077e1745483646.webp?x-oss-process=image/resize,m_fill,h_80,w_80/format,webp";

const computeProfit = (cost: number) => {
  const onePercent = Math.floor((cost * PROFIT_PERCENTAGE) / 100);
  if (onePercent > MIN_PROFIT && onePercent < MAX_PROFIT) {
    return {
      amount: onePercent,
      percentage: PROFIT_PERCENTAGE as 0 | 1,
      static: 0,
    };
  }
  const staticProfit = onePercent <= MIN_PROFIT ? MIN_PROFIT : MAX_PROFIT;
  return {
    amount: staticProfit,
    percentage: 0 as 0 | 1,
    static: staticProfit,
  };
};

(async () => {
  const digiflazz = new DigiFlazzService();

  const listProducts = await digiflazz.getPriceList({
    cmd: "prepaid",
  });

  const filterProducts = listProducts.data.filter((product) => {
    return (
      product.category.toLowerCase() === DF_PRODUCT_CATEGORY.toLowerCase() &&
      product.brand.toLowerCase() === DF_PRODUCT_BRAND.toLowerCase() &&
      DF_PRODUCT_TYPE.map((type) => type.toLowerCase()).includes(
        product.type.toLowerCase()
      )
    );
  });

  // Fetch existing DIGIFLAZZ products for the target sub-category
  const productFromDB = await db.query.products.findMany({
    where: and(
      eq(tb.products.product_sub_category_id, DB_PRODUCT_SUB_CATEGORY_ID),
      eq(tb.products.provider_name, ProductProvider.DIGIFLAZZ)
    ),
  });

  // Build quick lookup maps
  const dbByProviderCode = new Map(
    productFromDB.map((p) => [p.provider_code, p])
  );

  const nowListedProviderCodes = new Set(
    filterProducts.map((p) => p.buyer_sku_code)
  );

  // Helpers
  const sanitizeName = (name: string) => {
    let n = name;
    for (const r of DF_REPLACE_PRODUCT_TITLE) {
      n = n.replaceAll(r, "");
    }
    return n.trim().replace(/\s+/g, " ");
  };

  const toSkuCode = (buyerSku: string) => {
    // Deterministic short code based on buyer_sku_code
    const base = buyerSku.replace(/[^A-Za-z0-9]/g, "");
    return (base || "SKU").slice(0, 15);
  };

  const toDesc = (p: DigiFlazzProduct) => (p.desc ?? "").slice(0, 100);

  const upserts: Array<Promise<any>> = [];

  // Create or update each product from DigiFlazz
  for (const item of filterProducts) {
    const providerCode = item.buyer_sku_code;
    const existing = dbByProviderCode.get(providerCode);

    const providerPrice = Math.max(0, Math.floor(item.price));
    const stock = item.unlimited_stock ? 999999 : Math.max(0, item.stock ?? 0);
    const isAvailable = !!item.buyer_product_status;

    if (existing) {
      // Only update mutable fields; don't touch name or provider_code
      const profit = computeProfit(providerPrice);
      upserts.push(
        db
          .update(tb.products)
          .set({
            // name: sanitizeName(item.product_name),
            is_available: isAvailable,
            price: providerPrice + profit.amount,
            provider_price: providerPrice,
            provider_max_price: profit.amount, // set max price same as profit (requested)
            profit_static: profit.static,
            profit_percentage: profit.percentage,
            stock,
            notes: toDesc(item),
          })
          .where(eq(tb.products.id, existing.id))
      );
    } else {
      // Insert new product
      const name = sanitizeName(item.product_name);
      const skuCode = toSkuCode(providerCode);
      const profit = computeProfit(providerPrice);

      upserts.push(
        db.insert(tb.products).values({
          product_sub_category_id: DB_PRODUCT_SUB_CATEGORY_ID,
          name,
          description: toDesc(item),
          is_featured: false,
          is_available: isAvailable,
          image_url: PLACEHOLDER_IMAGE,
          sku_code: skuCode,
          price: providerPrice + profit.amount,
          profit_static: profit.static,
          profit_percentage: profit.percentage,
          stock: 9999,
          provider_code: providerCode,
          provider_name: ProductProvider.DIGIFLAZZ,
          provider_price: providerPrice,
          provider_max_price: profit.amount, // set max price same as profit (requested)
          provider_input_separator: "",
          billing_type: ProductBillingType.PREPAID, // use default
          fullfillment_type: ProductFullfillmentType.AUTOMATIC_DIRECT, // use default
        })
      );
    }
  }

  // Mark DB products not present in DigiFlazz list as unavailable
  const toDisable = productFromDB
    .filter((p) => !nowListedProviderCodes.has(p.provider_code))
    .map((p) => p.id);

  if (toDisable.length > 0) {
    upserts.push(
      db
        .update(tb.products)
        .set({ is_available: false })
        .where(inArray(tb.products.id, toDisable))
    );
  }

  // Execute all DB operations
  await Promise.all(upserts);

  console.log(
    JSON.stringify(
      {
        total_from_df: filterProducts.length,
        exists_in_db: productFromDB.length,
        created: filterProducts.filter(
          (p) => !dbByProviderCode.has(p.buyer_sku_code)
        ).length,
        updated: filterProducts.filter((p) =>
          dbByProviderCode.has(p.buyer_sku_code)
        ).length,
        disabled: toDisable.length,
      },
      null,
      2
    )
  );
})();
