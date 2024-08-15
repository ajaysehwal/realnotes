import express from "express";
import { Notes } from "../managers/notes";
import { AuthMiddleware } from "../middleware";

const router = express.Router();
router.use(AuthMiddleware.verifyToken);
router.get('/',Notes.getNotes);
router.post('/',Notes.createNote);
router.put('/:id',Notes.updateNote);
router.delete('/:id',Notes.deleteNote);

export default router;
