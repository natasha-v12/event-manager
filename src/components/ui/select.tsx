import React from 'react';

const Select = React.forwardRef<HTMLSelectElement, any>(({ className = '', children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`w-full border border-gray-300 p-2 rounded text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';
export default Select;
