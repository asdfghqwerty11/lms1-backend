"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dentists_controller_1 = require("../controllers/dentists.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware, auth_1.requireAuth);
// Applications (must be before /:id to avoid matching "applications" as an id)
router.get('/applications', dentists_controller_1.dentistsController.getDentistApplications);
router.put('/applications/:applicationId/review', dentists_controller_1.dentistsController.reviewApplication);
// Dentist CRUD
router.post('/', dentists_controller_1.dentistsController.createDentist);
router.get('/', dentists_controller_1.dentistsController.getDentists);
router.get('/:id', dentists_controller_1.dentistsController.getDentistById);
router.put('/:id', dentists_controller_1.dentistsController.updateDentist);
router.delete('/:id', dentists_controller_1.dentistsController.deleteDentist);
exports.default = router;
//# sourceMappingURL=dentists.routes.js.map