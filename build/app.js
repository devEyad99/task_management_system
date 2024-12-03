"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// //
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const AppRouter_1 = require("./AppRouter");
require("./controllers/auth.controller");
require("./user/controller/user.controller");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// routes here
app.use(AppRouter_1.AppRouter.getInstance());
// app.use('/api/auth', authRouter);
// app.use('/api/users', userRouter);
app.use('/api/tasks', task_routes_1.default);
exports.default = app;
