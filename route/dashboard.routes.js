import express from 'express';
import { getDashboardStats } from '../controller/dashboard.controller.js';
import { verifyToken } from '../middleware/verify.token.js';
const dashboardRoute = express.Router();

dashboardRoute.get('/', verifyToken, getDashboardStats);

export default dashboardRoute;
