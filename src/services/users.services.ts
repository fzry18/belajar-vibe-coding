import { db } from "../db";
import { users, sessions } from "../db/schema";

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

export const loginUser = async (data: any) => {
  const { email, password } = data;

  // Find user
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (user.length === 0) {
    throw new Error("Email atau Password salah");
  }

  // Verify password
  const isPasswordValid = await Bun.password.verify(password, user[0].password);
  if (!isPasswordValid) {
    throw new Error("Email atau Password salah");
  }

  // Generate token
  const token = crypto.randomUUID();

  // Save session
  await db.insert(sessions).values({
    token,
    userId: user[0].id,
  });

  return { token };
};

export const getCurrentUser = async (token: string) => {
  if (!token) {
    throw new Error("Token is required or invalid");
  }

  // Find session and join with user
  const result = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    createdAt: users.createdAt,
  })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (result.length === 0) {
    throw new Error("Token is required or invalid");
  }

  return result[0];
};

export const logoutUser = async (token: string) => {
  if (!token) {
    throw new Error("token is required or invalid");
  }

  // Delete session
  const result = await db.delete(sessions).where(eq(sessions.token, token));

  // In MySQL, result[0].affectedRows tells us if anything was deleted
  // However, result is often an array or object depending on the driver
  // Let's check if the deletion was successful
  if (result[0].affectedRows === 0) {
    throw new Error("token is required or invalid");
  }

  return null;
};

