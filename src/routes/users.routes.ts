import { Elysia, t } from "elysia";
import { registerUser } from "../services/users.services";

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
  });


