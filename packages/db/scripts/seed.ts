import "dotenv/config";

import { client, db } from "@/database";
import { users } from "@/schema";

const times = (v: number) =>
  Array(v)
    .fill(null)
    .map((_, i) => i + 1);

const main = async (): Promise<void> => {
  const a = await db
    .insert(users)
    .values({
      name: "anang",
      email: "anang@gmail.com",
      password: "password123",
    })
    .returning();

  console.log("Inserted user:", a);

  await await client.end();
  process.exit(0);
};

void main();
