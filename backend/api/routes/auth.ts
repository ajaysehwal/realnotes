import express from "express";
import { Auth } from "../managers/auth";
import { AuthMiddleware } from "../middleware";

const router = express.Router();
router.post("/register", Auth.register);
router.post("/login", Auth.login);
router.get("/profile", AuthMiddleware.verifyToken, Auth.getProfile);
router.post('/refresh-token',AuthMiddleware.verifyToken, Auth.refreshToken)
export default router;