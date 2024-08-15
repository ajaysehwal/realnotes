import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaPlus,
  FaBars,
  FaTimes,
  FaPen,
  FaTrash,
} from "react-icons/fa";
import { Note } from "../types";
import { useNotes } from "../hooks/useNotes";

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNoteSelect: (note: Note) => void;
  onNewNote: () => void;
  isLoading: boolean;
}

const SkeletonLoader = () => (
  <div className="space-y-4 animate-pulse p-4">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="bg-gray-100 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    ))}
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  selectedNoteId,
  searchTerm,
  onSearchChange,
  onNoteSelect,
  onNewNote,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { deleteNote } = useNotes();
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const noteCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: {
      scale: 1.02,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.98 },
  };

  const siteNameVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5 } },
  };

  return (
    <>
      <AnimatePresence>
        {isMobile && (
          <motion.button
            className="fixed top-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg"
            onClick={toggleSidebar}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div
        className={`bg-white flex flex-col fixed lg:relative md:relative h-screen w-80 left-0 top-0 z-40
                    shadow-xl ${
                      isMobile
                        ? isOpen
                          ? "translate-x-0"
                          : "-translate-x-full"
                        : ""
                    }`}
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen || !isMobile ? "open" : "closed"}
      >
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800">
          <motion.h1
            className="text-2xl font-bold text-white mb-6 text-center"
            variants={siteNameVariants}
            initial="hidden"
            animate="visible"
          >
            Real <span className="text-blue-200 text-3xl">Notes</span>
          </motion.h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-blue-300 bg-white bg-opacity-20 text-white placeholder-blue-200 transition-all duration-300 outline-none"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50 custom-scrollbar">
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            <AnimatePresence>
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  className={`p-4 cursor-pointer hover:bg-blue-50 transition-all duration-300 border-b border-gray-200
                              ${
                                selectedNoteId === note.id ? "bg-blue-100" : ""
                              }`}
                  variants={noteCardVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -20 }}
                  whileHover="hover"
                  whileTap="tap"
                  layout
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1" onClick={() => onNoteSelect(note)}>
                      <h3 className="font-semibold text-gray-800 truncate">
                        {note.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {note.content}
                      </p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="flex items-center"
                    >
                      <motion.button
                        className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id as string);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaTrash />
                      </motion.button>
                    </motion.div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">
                      {new Date(note.updatedAt as number).toLocaleDateString()}
                    </p>
                    <FaPen className="text-blue-500 text-xs" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        <motion.button
          className="m-4 flex items-center justify-center w-11/12 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
          onClick={onNewNote}
          whileHover={{
            scale: 1.03,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          <FaPlus className="mr-2" /> New Note
        </motion.button>
      </motion.div>
    </>
  );
};
