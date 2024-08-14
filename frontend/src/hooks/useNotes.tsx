import { useState, useEffect } from 'react';
import { Note } from '../types';
import api from '../services/api';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/api/notes');
      setNotes(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch notes');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await api.post('/api/notes', note);
      setNotes([response.data, ...notes]);
    } catch (err) {
      setError('Failed to add note');
    }
  };

  const updateNote = async (id: string, updatedNote: Partial<Note>) => {
    try {
     const updated=await api.put(`/api/notes/${id}`, updatedNote);
     console.log(updated)
      setNotes(notes.map(note => note.id === id ? { ...note, ...updatedNote } : note));
    } catch (err) {
      setError('Failed to update note');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await api.delete(`/api/notes/${id}`);
      setNotes(notes.filter(note => note.id !== id));
    } catch (err) {
      setError('Failed to delete note');
    }
  };

  return { notes, loading, error, addNote, updateNote, deleteNote,setNotes };
};
