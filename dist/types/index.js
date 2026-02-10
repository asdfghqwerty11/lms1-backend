"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationParams = void 0;
// Pagination helpers
const getPaginationParams = (page, limit) => {
    const p = parseInt(page || '1', 10);
    const l = parseInt(limit || '20', 10);
    const validPage = Math.max(1, isNaN(p) ? 1 : p);
    const validLimit = Math.min(100, Math.max(1, isNaN(l) ? 20 : l));
    return {
        page: validPage,
        limit: validLimit,
        skip: (validPage - 1) * validLimit,
    };
};
exports.getPaginationParams = getPaginationParams;
//# sourceMappingURL=index.js.map