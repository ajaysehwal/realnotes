import { db } from "./firebase";
import { Note } from "../interface";
import * as admin from "firebase-admin";

export class NoteService {
  static async getNotes(userId: string): Promise<Note[]> {
    const notesRef = db.ref("notes");
    const snapshot = await notesRef
      .orderByChild("userId")
      .equalTo(userId)
      .once("value");

    const notes: Note[] = [];
    snapshot.forEach((childSnapshot) => {
      notes.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
      });
    });

    return notes.sort((a: Note, b: Note) => b.createdAt - a.createdAt);
  }

  static async createNote(
    userId: string,
    title: string,
    content: string
  ): Promise<Note> {
    const newNote: Omit<Note, "id"> = {
      userId,
      title,
      content,
      createdAt: admin.database.ServerValue.TIMESTAMP as number,
      updatedAt: admin.database.ServerValue.TIMESTAMP as number,
    };

    const newNoteRef = db.ref("notes").push();
    await newNoteRef.set(newNote);

    const createdNoteSnapshot = await newNoteRef.once("value");
    const createdNote: Note = createdNoteSnapshot.val();
    return { id: newNoteRef.key!, ...createdNote };
  }

  static async updateNote(
    id: string,
    userId: string,
    updates: { title: string; content: string }
  ): Promise<void> {
    const noteRef = db.ref(`notes/${id}`);
    const snapshot = await noteRef.once("value");

    if (!snapshot.exists() || snapshot.val().userId !== userId) {
      throw new Error("Note not found");
    }

    await noteRef.update({
      ...updates,
      updatedAt: admin.database.ServerValue.TIMESTAMP,
    });
  }

  static async deleteNote(id: string, userId: string): Promise<void> {
    const noteRef = db.ref(`notes/${id}`);
    const snapshot = await noteRef.once("value");

    if (!snapshot.exists() || snapshot.val().userId !== userId) {
      throw new Error("Note not found");
    }

    await noteRef.remove();
  }
}
