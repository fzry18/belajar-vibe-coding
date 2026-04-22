import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const registerUser = async (data: any) => {
  const { name, email, password } = data;

  // Check if user already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await Bun.password.hash(password);

  // Insert user
  const result = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // Fetch the created user to get the ID (MySQL serial returns the ID)
  // In Drizzle MySQL, insert returns an array with information about the insert
  const userId = result[0].insertId;

  return {
    id: userId,
    name,
    email,
  };
};
