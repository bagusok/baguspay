import { db } from "@/database";
import { UserRole } from "@/schema";
import { tb } from "@/table";
import bcrypt from "bcrypt";
import { InferInsertModel } from "drizzle-orm";

const user: InferInsertModel<typeof tb.users>[] = [
  {
    id: "91319975-2d4a-4704-9963-7d3d66506ae1",
    email: "okebagus426@gmail.com",
    password: bcrypt.hashSync("B@gusok55", 10),
    name: "Okebagus",
    phone: "08123456789",
    role: UserRole.ADMIN,
  },
  {
    id: "00000000-0000-0000-0000-000000000001",
    email: "guest@baguspay.id",
    password: bcrypt.hashSync("B@gusok55", 10),
    name: "Guest User",
    phone: "08123123123",
    role: UserRole.GUEST,
  },
];

export const userSeed = async () => {
  await db.insert(tb.users).values(user).onConflictDoNothing();
};
