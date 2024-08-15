import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const UserAccount: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const getInitial = (email: string) => email[0].toUpperCase();
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const avatarColor = useMemo(() => getRandomColor(), []);
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  const getName = (email:string) => {
    const [name] = email.split('@');
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };
  
  if (!user) return null;

  return (
    <div className="fixed top-4 right-4">
      <motion.div
        className="flex items-center cursor-pointer"
        onClick={toggleDropdown}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div
          className="w-10 h-10 rounded-full  flex items-center justify-center mr-2"
          style={{ backgroundColor: avatarColor }}
        >
          <span className="text-white text-lg font-bold">
            {getInitial(user.email)}
          </span>
        </div>
        <span>{getName(user.email)}</span>

      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1"
          >
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Profile
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Settings
            </a>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserAccount;
