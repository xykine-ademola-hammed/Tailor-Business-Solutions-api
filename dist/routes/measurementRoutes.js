"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const measurementController_1 = require("../controllers/measurementController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', measurementController_1.getMeasurements);
router.get('/:id', measurementController_1.getMeasurement);
router.post('/', measurementController_1.createMeasurement);
router.put('/:id', measurementController_1.updateMeasurement);
router.delete('/:id', measurementController_1.deleteMeasurement);
exports.default = router;
//# sourceMappingURL=measurementRoutes.js.map