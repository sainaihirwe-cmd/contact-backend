import express from 'express';
import { createContact, getContacts } from '../controllers/ContactController.js';

const router = express.Router();

router.post('/', createContact);
router.get('/', getContacts);

export default router;
