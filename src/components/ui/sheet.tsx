import * as React from 'react';
import { cn } from '@/src/lib/utils';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function Sheet({ open, onOpenChange, children, side = 'right' }: SheetProps) {
  if (!open) return null;

  const sideStyles = {
    top: 'top-0 left-0 right-0 max-h-[80vh] border-b',
    bottom: 'bottom-0 left-0 right-0 max-h-[80vh] border-t',
    left: 'top-0 bottom-0 left-0 w-full max-w-sm border-r',
    right: 'top-0 bottom-0 right-0 w-full max-w-sm border-l',
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          'fixed z-50 flex flex-col bg-neutral-900 border-neutral-800 p-6 shadow-2xl text-neutral-100 transition-transform duration-300 ease-in-out',
          sideStyles[side]
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-2 text-left mb-4', className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold text-white', className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-neutral-400', className)} {...props} />;
}
