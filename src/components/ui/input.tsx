import React from 'react';

const Input = React.forwardRef<HTMLInputElement, any>(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full border border-gray-300 p-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-neutral-700 dark:placeholder-neutral-400 ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';
export default Input;
