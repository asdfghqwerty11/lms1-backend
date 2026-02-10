"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const database_1 = require("./config/database");
const storage_1 = require("./config/storage");
const env_1 = __importDefault(require("./config/env"));
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: env_1.default.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours
}));
// Body parser middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Request logging middleware (development only)
if (env_1.default.NODE_ENV === 'development') {
    app.use((req, _res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
}
// Rate limiting
app.use(rateLimiter_1.apiLimiter);
// Static files
app.use('/uploads', express_1.default.static(env_1.default.UPLOAD_DIR));
// Routes
app.use('/', routes_1.default);
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
// Start server
const PORT = env_1.default.PORT;
const startServer = async () => {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
        // Initialize Supabase Storage
        try {
            await (0, storage_1.initStorage)();
        }
        catch (error) {
            console.warn('Warning: Failed to initialize Supabase storage:', error);
            console.warn('File uploads will not work until Supabase is properly configured');
        }
        // Start listening
        const server = app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     Dental Lab Management System API                     ║
║     ${env_1.default.NODE_ENV.toUpperCase().padEnd(47)}║
║     Server running on http://localhost:${PORT}                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
        });
        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                await (0, database_1.disconnectDatabase)();
                console.log('Database connection closed');
                process.exit(0);
            });
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map