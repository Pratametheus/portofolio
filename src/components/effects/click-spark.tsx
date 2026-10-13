'use client';

import React, {useRef, useEffect, useCallback} from 'react';

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

export function ClickSpark({
  sparkColor,
  sparkSize = 8,
  sparkRadius = 14,
  sparkCount = 8,
  duration = 380,
  children,
  className = ''
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);

  const getColor = useCallback(() => {
    if (sparkColor) return sparkColor;
    if (typeof document !== 'undefined') {
      const isNight = document.documentElement.dataset.theme === 'night';
      return isNight ? '#b98558' : '#8f5f18';
    }
    return '#8f5f18';
  }, [sparkColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resize();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(resize);
      ro.observe(parent);
      return () => ro.disconnect();
    }
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const now = performance.now();
    const newSparks: Spark[] = Array.from({length: sparkCount}, (_, i) => ({
      x,
      y,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: now
    }));

    sparksRef.current.push(...newSparks);
  };

  useEffect(() => {
    let animId: number;

    const draw = (now: number) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const color = getColor();

          sparksRef.current = sparksRef.current.filter((spark) => {
            const elapsed = now - spark.startTime;
            if (elapsed >= duration) return false;

            const progress = elapsed / duration;
            const distance = sparkRadius * progress;
            const currentX = spark.x + Math.cos(spark.angle) * distance;
            const currentY = spark.y + Math.sin(spark.angle) * distance;
            const opacity = 1 - progress;

            ctx.save();
            ctx.fillStyle = color;
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(currentX, currentY, sparkSize * (1 - progress * 0.5), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            return true;
          });
        }
      }
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [duration, getColor, sparkRadius, sparkSize]);

  return (
    <div className={`relative ${className}`} onClick={handleClick}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-50 size-full"
      />
      {children}
    </div>
  );
}
