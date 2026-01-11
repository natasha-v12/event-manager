import React from 'react';

const Checkbox = React.forwardRef<HTMLInputElement, any>(({ className = '', ...props }, ref) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      className={`h-4 w-4 ${className}`}
      {...props}
    />
  );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;
