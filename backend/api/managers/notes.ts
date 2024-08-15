import { NoteService } from "../services/notes";
import { Request, Response } from "express";

export class Notes {
  static async getNotes(req: Request, res: Response): Promise<void> {
    const userId = req.user!.uid;
    try {
      const notes = await NoteService.getNotes(userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
  static async createNote(req: Request, res: Response): Promise<void> {
    const { title, content } = req.body;
    const userId = req.user!.uid;
    try {
      const newNote = await NoteService.createNote(userId, title, content);
      res.status(201).json(newNote);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
  static async updateNote(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user!.uid;
    try {
      await NoteService.updateNote(id, userId, { title, content });

      res.json({ status: true });
    } catch (error) {
      if ((error as Error).message === "Note not found") {
        res.status(404).json({ error: "Note not found" });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  }
  static async deleteNote(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.uid;

    try {
      await NoteService.deleteNote(id, userId);
      res.json({ message: "Note deleted successfully" });
    } catch (error) {
      if ((error as Error).message === "Note not found") {
        res.status(404).json({ error: "Note not found" });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  }
}
