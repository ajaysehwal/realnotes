import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface InputProps extends HTMLMotionProps<"input"> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={props.id}>
          {label}
        </label>
        <motion.input
          ref={ref}
          className={`
            shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 
            leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className || ''}
          `}
          whileFocus={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-xs italic mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';