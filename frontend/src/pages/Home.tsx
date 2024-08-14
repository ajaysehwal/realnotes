import React, { useState, useEffect } from "react";
import debounce from "lodash/debounce";
import { Layout } from "../components/Layout";
import { NoteEditor } from "../components/NoteEditor";
import { Note } from "../types";
import { useNotes } from "../hooks/useNotes";

export const Notes: React.FC = () => {
  const { notes, loading, error, addNote, updateNote, deleteNote, setNotes } =
    useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<Note[]>(notes);

  const handleNoteSelect = (note: Note) => setSelectedNote(note);
  useEffect(() => {
    setFilteredNotes(notes);
  }, [notes]);
  const handleNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled",
      content: "",
      lastModified: new Date(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    addNote(newNote);
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    await updateNote(id, { title: updates.title, content: updates.content });
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, ...updates, lastModified: new Date() } : note
    );
    setNotes(updatedNotes);
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote({
        ...selectedNote,
        ...updates,
        lastModified: new Date(),
      });
    }
  };

  const handleDeleteNote = async (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote(null);
    }
    await deleteNote(id);
  };

  const debouncedSearch = debounce((term: string) => {
    const filtered = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(term.toLowerCase()) ||
        note.content.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredNotes(filtered);
  }, 300);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, notes]);

  return (
    <Layout
      notes={filteredNotes}
      selectedNoteId={selectedNote?.id || null}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onNoteSelect={handleNoteSelect}
      onNewNote={handleNewNote}
    >
      {selectedNote ? (
        <NoteEditor
          note={selectedNote}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Select a note or create a new one
        </div>
      )}
    </Layout>
  );
};
