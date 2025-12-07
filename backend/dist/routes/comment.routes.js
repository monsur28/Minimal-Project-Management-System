"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comment_controller_1 = require("../controllers/comment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router({ mergeParams: true });
router.route('/').get(auth_middleware_1.protect, comment_controller_1.getComments).post(auth_middleware_1.protect, comment_controller_1.createComment);
exports.default = router;
