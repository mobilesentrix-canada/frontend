
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text = 'Loading...',
  className,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const containerClasses = cn(
    'flex flex-col items-center justify-center gap-2',
    fullScreen && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
    !fullScreen && 'p-4',
    className
  );

  return (
    <div className={containerClasses}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && (
        <p className={cn('text-muted-foreground', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
};

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  );
};

export const InlineLoading: React.FC<{ text?: string; size?: 'sm' | 'md' }> = ({
  text = 'Loading...',
  size = 'sm'
}) => {
  return (
    <div className="inline-flex items-center gap-2">
      <LoadingSpinner size={size} />
      <span className={cn(size === 'sm' ? 'text-sm' : 'text-base', 'text-muted-foreground')}>
        {text}
      </span>
    </div>
  );
};
