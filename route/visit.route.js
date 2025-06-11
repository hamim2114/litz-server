import express from 'express';
import { recordVisit } from '../controller/visit.controller.js';

const visitRoute = express.Router();

visitRoute.post('/:slug', recordVisit);

export default visitRoute;
