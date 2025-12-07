"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const project_controller_1 = require("../controllers/project.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const sprint_routes_1 = __importDefault(require("./sprint.routes"));
const task_routes_1 = __importDefault(require("./task.routes"));
const router = express_1.default.Router();
router.use('/:projectId/sprints', sprint_routes_1.default);
router.use('/:projectId/tasks', task_routes_1.default);
router.route('/').get(auth_middleware_1.protect, project_controller_1.getProjects).post(auth_middleware_1.protect, project_controller_1.createProject);
router
    .route('/:id')
    .get(auth_middleware_1.protect, project_controller_1.getProjectById)
    .put(auth_middleware_1.protect, project_controller_1.updateProject)
    .delete(auth_middleware_1.protect, project_controller_1.deleteProject);
exports.default = router;
