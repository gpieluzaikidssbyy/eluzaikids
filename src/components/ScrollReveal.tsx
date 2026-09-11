import type { CSSProperties, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ScrollReveal({ children, delay = 0, className }: ScrollRevealProps) {
  const style: CSSProperties = {
    animationDelay: `${Math.min(delay, 300)}ms`,
  };
  return (
    <div className={`eluzai-reveal ${className ?? ''}`.trim()} style={style}>
      {children}
    </div>
  );
}