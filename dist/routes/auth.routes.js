"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', rateLimiter_1.authLimiter, auth_controller_1.authController.register);
router.post('/login', rateLimiter_1.authLimiter, auth_controller_1.authController.login);
router.post('/refresh-token', auth_controller_1.authController.refreshToken);
router.post('/forgot-password', rateLimiter_1.authLimiter, auth_controller_1.authController.forgotPassword);
router.post('/reset-password', rateLimiter_1.authLimiter, auth_controller_1.authController.resetPassword);
// Protected routes
router.get('/me', auth_1.authMiddleware, auth_1.requireAuth, auth_controller_1.authController.getCurrentUser);
router.post('/logout', auth_1.authMiddleware, auth_1.requireAuth, auth_controller_1.authController.logout);
router.post('/update-password', auth_1.authMiddleware, auth_1.requireAuth, auth_controller_1.authController.updatePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map