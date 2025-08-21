import { db } from "@/database";
import { productCategorySeeds } from "./seeds/product-category";
import { userSeed } from "./seeds/user";

(async () => {
  const _db = db;

  await userSeed();
  await productCategorySeeds(_db);
})();
