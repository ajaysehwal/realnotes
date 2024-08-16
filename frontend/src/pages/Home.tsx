import React, { useState, useEffect } from "react";
import debounce from "lodash/debounce";
import { Layout } from "../components/Layout";
import { NoteEditor } from "../components/NoteEditor";
import { Note } from "../types";
import { useNotes } from "../hooks/useNotes";
import UserAccount from "../components/Account";
import { toast, ToastContainer } from "react-toastify";

export const Notes: React.FC = () => {
  const {
    notes,
    error,
    addNote,
    loading,
    updateNote,
    deleteNote,
    setNotes,
    setSelectedNote,
    selectedNote,
  } = useNotes();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<Note[]>(notes);

  const handleNoteSelect = (note: Note) => setSelectedNote(note);
  useEffect(() => {
    setFilteredNotes(notes);
  }, [notes]);
  const handleNewNote = () => {
    const newNote = {
      title: "Untitled",
      content: "",
    };
    addNote(newNote);
  };
  const updateLocalState = (id: string, updates: Partial<Note>) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, ...updates } : note
    );
    setNotes(updatedNotes);
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote({
        ...selectedNote,
        ...updates,
      });
    }
  };
  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    await updateNote(id, { title: updates.title, content: updates.content });
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

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error]);
  return (
    <>
      <Layout
        notes={filteredNotes}
        selectedNoteId={selectedNote?.id as string}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNoteSelect={handleNoteSelect}
        onNewNote={handleNewNote}
        Load={loading}
      >
        {selectedNote ? (
          <NoteEditor
            note={selectedNote}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
            onLocalUpdate={updateLocalState}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a note or create a new one
          </div>
        )}
      </Layout>
      <UserAccount />
      <ToastContainer />
    </>
  );
};
