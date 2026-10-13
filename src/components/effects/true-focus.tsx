'use client';

import React, {useEffect, useRef, useState} from 'react';
import {motion} from 'motion/react';

interface TrueFocusProps {
  sentence: string;
  className?: string;
  animationInterval?: number;
}

export function TrueFocus({
  sentence,
  className = '',
  animationInterval = 2800
}: TrueFocusProps) {
  const words = sentence.split(' ');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [box, setBox] = useState<{x: number; y: number; width: number; height: number}>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, animationInterval);

    return () => clearInterval(timer);
  }, [animationInterval, mounted, words.length]);

  useEffect(() => {
    if (!mounted) return;
    const wordEl = wordRefs.current[currentIndex];
    const containerEl = containerRef.current;
    if (!wordEl || !containerEl) return;

    const cRect = containerEl.getBoundingClientRect();
    const wRect = wordEl.getBoundingClientRect();

    setBox({
      x: wRect.left - cRect.left,
      y: wRect.top - cRect.top,
      width: wRect.width,
      height: wRect.height
    });
  }, [currentIndex, mounted]);

  return (
    <span ref={containerRef} className={`relative inline-block ${className}`}>
      {mounted && box.width > 0 ? (
        <motion.span
          aria-hidden="true"
          animate={{
            x: box.x - 4,
            y: box.y - 2,
            width: box.width + 8,
            height: box.height + 4
          }}
          transition={{type: 'spring', stiffness: 350, damping: 28}}
          className="pointer-events-none absolute rounded border border-accent bg-accent/10"
        />
      ) : null}

      {words.map((word, idx) => (
        <React.Fragment key={idx}>
          <span
            ref={(el) => {
              wordRefs.current[idx] = el;
            }}
            className={`relative z-10 inline-block transition-colors ${
              idx === currentIndex ? 'text-fg font-semibold' : 'text-fg'
            }`}
            onMouseEnter={() => setCurrentIndex(idx)}
          >
            {word}
          </span>
          {idx < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </span>
  );
}
