"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sprint_controller_1 = require("../controllers/sprint.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router({ mergeParams: true });
router.route('/').get(auth_middleware_1.protect, sprint_controller_1.getSprints).post(auth_middleware_1.protect, sprint_controller_1.createSprint);
router
    .route('/:id')
    .put(auth_middleware_1.protect, sprint_controller_1.updateSprint)
    .delete(auth_middleware_1.protect, sprint_controller_1.deleteSprint);
exports.default = router;
