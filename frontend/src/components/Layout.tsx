// Layout.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Note } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    notes: Note[];
    selectedNoteId: string | null;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onNoteSelect: (note: Note) => void;
    onNewNote: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
    children, 
    notes, 
    selectedNoteId, 
    searchTerm, 
    onSearchChange, 
    onNoteSelect, 
    onNewNote 
}) => {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar 
                notes={notes}
                selectedNoteId={selectedNoteId}
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                onNoteSelect={onNoteSelect}
                onNewNote={onNewNote}
            />
            <motion.div
                className="flex-1 overflow-hidden"
                initial={false}
                animate={{ marginLeft: '1px' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <main className="h-full overflow-y-auto p-8 bg-white">
                    {children}
                </main>
            </motion.div>
        </div>
    );
};