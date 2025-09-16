'use client';

import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useRef } from 'react';

export function InputDescription({
  className,
  placeholder,
  value,
  disabled = false,
  ...props
}: React.ComponentProps<'textarea'>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 10 * 24; // 10 lines * 24px line height
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [value]);

  return (
    <Textarea
      spellCheck={true}
      ref={textareaRef}
      className={cn(
        'min-h-[144px] max-h-[240px] overflow-y-auto resize-none',
        className,
      )}
      rows={6}
      {...props}
    />
  );
}
