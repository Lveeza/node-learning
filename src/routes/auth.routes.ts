import { Router } from "express";
import { register, login } from "../services/authService.js";
import { validate } from "../http/middleware/validate.js";
import { registerSchema, type RegisterInput } from "../schemas/auth.schema.js";
import { loginSchema, type LoginInput } from "../schemas/auth.schema.js";

const router = Router();

router.post("/register", validate(registerSchema), async (req, res) => {
  const { email, password } = req.valid.body as RegisterInput;
  res.status(201).json(await register(email, password));
});

router.post(
  '/login',
  validate(loginSchema),
  async (req, res) => {
    const { email, password } = req.valid.body as LoginInput;
    res.status(200).json(await login(email, password));
  }
);

export default router;
