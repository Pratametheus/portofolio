'use client';

import React, {useState, useEffect, useRef} from 'react';

const CHARS = 'ABCDEF0123456789!@#$%^&*()_+~|}{[]:;?><';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  className?: string;
}

export function DecryptedText({
  text,
  speed = 40,
  maxIterations = 10,
  className = ''
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const iterationRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  const triggerAnimation = () => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);
    iterationRef.current = 0;

    intervalRef.current = setInterval(() => {
      setDisplayText((_) =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iterationRef.current) return text[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      if (iterationRef.current >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
      }

      iterationRef.current += 1 / (maxIterations / text.length);
    }, speed);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    triggerAnimation();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <span
      className={`inline-block font-mono ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {displayText}
    </span>
  );
}
