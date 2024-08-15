import { useState, useEffect, useCallback } from "react";
import { Note } from "../types";
import api from "../services/api";

interface UseNotesResult {
  notes: Note[];
  loading: boolean;
  error: string | null;
  addNote: (
    note: Omit<Note, "id" | "userId" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateNote: (id: string, updatedNote: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export const useNotes = (): UseNotesResult => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((message: string) => {
    setError(message);
    console.error(message);
  }, []);

  const refreshNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Note[]>("/api/notes");
      setNotes(response.data);
    } catch (err) {
      handleError("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  const addNote = useCallback(
    async (note: Omit<Note, "id" | "userId" | "createdAt" | "updatedAt">) => {
      try {
        await api.post("/api/notes", note);
      } catch (err) {
        handleError("Failed to add note");
      }
    },
    [refreshNotes, handleError]
  );

  const updateNote = useCallback(
    async (id: string, updatedNote: Partial<Note>) => {
      try {
        await api.put(`/api/notes/${id}`, updatedNote);
      } catch (err) {
        handleError("Failed to update note");
      }
    },
    [refreshNotes, handleError]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/api/notes/${id}`);
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      } catch (err) {
        handleError("Failed to delete note");
      }
    },
    [handleError]
  );

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    refreshNotes,
    setNotes,
  };
};
