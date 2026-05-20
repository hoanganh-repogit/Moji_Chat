import expess from "express";
import { authMe } from "../controllers/userControllers.js";
import { test } from "../controllers/userControllers.js";

const router = expess.Router();

router.get("/me", authMe);

router.get("/test", test);
export default router;
