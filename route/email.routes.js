import express from 'express';
import { getEmailsBySlug, recordEmail } from '../controller/email.controller.js';
const emailRoute = express.Router();

emailRoute.post('/:slug', recordEmail);
emailRoute.get('/:slug', getEmailsBySlug);

export default emailRoute;