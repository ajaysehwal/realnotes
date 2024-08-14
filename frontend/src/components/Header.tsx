import React from 'react';
import { FaBars, FaSearch } from 'react-icons/fa';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none focus:text-gray-600">
            <FaBars className="h-6 w-6" />
          </button>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:bg-white focus:shadow"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FaSearch className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};