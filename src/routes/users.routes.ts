import { Elysia, t } from "elysia";
import { registerUser, loginUser } from "../services/users.services";

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
  });



