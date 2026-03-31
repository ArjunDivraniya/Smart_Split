'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor = () => {
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the movement with spring physics
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 16);
      mouseY.set(e.clientY - 16);
      
      const target = e.target as HTMLElement;
      setIsHovering(
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') !== null || 
        target.closest('a') !== null ||
        target.classList.contains('cursor-pointer')
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <>
      {/* Central Pointer Dot */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          scale: isHovering ? 2.5 : 1,
        }}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-[#00FF9D]/30 pointer-events-none z-[9999] hidden lg:flex items-center justify-center mix-blend-difference"
      >
        <div className="w-1.5 h-1.5 bg-[#00FF9D] rounded-full" />
      </motion.div>

      {/* Large Spotlight Glow */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-45%',
          translateY: '-45%',
        }}
        className="fixed top-0 left-0 w-[400px] h-[400px] bg-[#00FF9D]/5 rounded-full blur-[80px] pointer-events-none z-[9998] hidden lg:block"
      />
    </>
  );
};

export default CustomCursor;
