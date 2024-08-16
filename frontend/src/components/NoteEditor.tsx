import React from "react";
import { motion } from "framer-motion";
import { FaTrash } from "react-icons/fa";
import { Note } from "../types";
// import { debounce } from "lodash";

interface NoteEditorProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onLocalUpdate: (id: string, updates: Partial<Note>) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onUpdate,
  onDelete,
  onLocalUpdate,
}) => {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    onLocalUpdate(note.id as string, {
      title: newTitle,
      content: note.content,
    });
    if (note.title !== newTitle) {
      setTimeout(() => {
        onUpdate(note.id as string, {
          title: newTitle,
          content: note.content,
        });
      }, 2000);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    onLocalUpdate(note.id as string, {
      title: note.title,
      content: newContent,
    });
    if (note.content !== newContent) {
      setTimeout(() => {
        onUpdate(note.id as string, {
          title: note.title,
          content: newContent,
        });
      }, 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white rounded-lg p-6 h-full"
    >
      <div className="flex justify-between items-center mb-4">
        <input
          name="title"
          type="text"
          value={note.title}
          onChange={handleTitleChange}
          className="text-3xl font-bold bg-transparent border-none outline-none w-full text-gray-800"
          placeholder="Note Title"
        />
        <motion.button
          className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors duration-300"
          onClick={() => onDelete(note.id as string)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaTrash />
        </motion.button>
      </div>
      <textarea
        name="content"
        value={note.content}
        onChange={handleContentChange}
        className="w-full h-[calc(100vh-200px)] p-4 rounded-lg outline-none resize-none focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300"
        placeholder="Start typing your note here..."
      />
      <p className="text-xs text-gray-400 mt-4">
        Last modified: {new Date(note.updatedAt as number).toLocaleString()}
      </p>
    </motion.div>
  );
};
