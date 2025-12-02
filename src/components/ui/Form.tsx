'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Input component
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'w-full px-4 py-3 bg-secondary border border-border rounded-xl',
            'text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'w-full px-4 py-3 bg-secondary border border-border rounded-xl',
            'text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-none transition-colors',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Select component
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <select
          className={cn(
            'w-full px-4 py-3 bg-secondary border border-border rounded-xl',
            'text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors appearance-none cursor-pointer',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          ref={ref}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const variantClasses = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      ghost: 'hover:bg-secondary text-foreground',
      outline: 'border border-border bg-transparent hover:bg-secondary text-foreground',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5',
      lg: 'px-6 py-3 text-lg',
    };
    
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-xl',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="w-4 h-4 mr-2 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Card component
export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl border border-border shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
