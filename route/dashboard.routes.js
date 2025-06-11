import express from 'express';
import { getDashboardStats } from '../controller/dashboard.controller.js';
const dashboardRoute = express.Router();

dashboardRoute.get('/', getDashboardStats);

export default dashboardRoute;