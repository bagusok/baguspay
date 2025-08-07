import { db } from "@/database";
import { productCategorySeeds } from "./seeds/product-category";

(async () => {
  const _db = db;

  await productCategorySeeds(_db);
})();
