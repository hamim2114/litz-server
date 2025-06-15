import express from 'express';
import { getEmailsBySlug, recordEmail } from '../controller/email.controller.js';
const emailRoute = express.Router();

emailRoute.post('/record/:slug', recordEmail);
emailRoute.get('/all/:slug', getEmailsBySlug);

export default emailRoute;