import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users.services";



export const usersRoutes = new Elysia({ prefix: "/api/users" })
  .post("/", async ({ body, set }) => {
    try {
      const newUser = await registerUser(body);
      return {
        message: "User created successfully",
        data: {
          status: "ok",
          ...newUser
        }
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: "User already exists",
        data: {
          status: "error",
          error: error.message
        }
      };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String()
    })
  })
  .post("/login", async ({ body, set }) => {
    try {
      const { token } = await loginUser(body);
      return {
        message: "User login successfully",
        data: {
          token
        }
      };
    } catch (error: any) {
      set.status = 401;
      return {
        message: "Email atau Password salah",
        data: {
          status: "error",
          error: "Email atau Password salah"
        }
      };
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    })
  })
  .get("/current", async ({ headers, set }) => {
    try {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Token is required or invalid");
      }

      const token = authHeader.split(" ")[1];
      const user = await getCurrentUser(token);

      return {
        message: "User current successfully",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      };
    } catch (error: any) {
      set.status = 401;
      return {
        message: "Failed to get user",
        data: {
          status: "error",
          error: "Token is required or invalid"
        }
      };
    }
  })
  .get("/logout", async ({ headers, set }) => {
    try {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("token is required or invalid");
      }

      const token = authHeader.split(" ")[1];
      await logoutUser(token);

      return {
        message: "User logged out successfully",
        data: null
      };
    } catch (error: any) {
      set.status = 401;
      return {
        message: "Failed to logout user",
        data: {
          status: "error",
          error: "token is required or invalid"
        }
      };
    }
  });





