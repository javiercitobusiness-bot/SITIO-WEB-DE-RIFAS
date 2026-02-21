import React from 'react';
import { cn } from '../lib/utils';

export default function Diamond({ className, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('w-6 h-6', className)}
      {...props}
    >
      <path d="M12 2L2 9l10 13 10-13L12 2z" />
      <path d="M12 2L2 9h20L12 2z" opacity="0.3" />
      <path d="M7 9l5 13 5-13H7z" opacity="0.5" />
    </svg>
  );
}
