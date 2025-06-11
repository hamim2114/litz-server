import express from 'express';
import { createLink, deleteLink, getAllLinks, getLinkBySlug, updateLink } from '../controller/link.controller.js';
const linkRoute = express.Router();

linkRoute.post('/', createLink);
linkRoute.get('/', getAllLinks);
linkRoute.get('/:slug', getLinkBySlug);
linkRoute.put('/:id', updateLink);
linkRoute.delete('/:id', deleteLink);


export default linkRoute;
