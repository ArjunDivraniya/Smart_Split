'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor = () => {
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // High-fidelity spring physics (Heavy/Smooth)
  const springConfig = { damping: 30, stiffness: 250, mass: 0.6 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      // Offset by half of cursor size
      mouseX.set(e.clientX - 20);
      mouseY.set(e.clientY - 20);
      
      const target = e.target as HTMLElement;
      setIsHovering(
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') !== null || 
        target.closest('a') !== null ||
        target.classList.contains('cursor-pointer') ||
        target.getAttribute('role') === 'button'
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <>
      {/* Precision Crosshair Cursor */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
        }}
        className="fixed top-0 left-0 w-10 h-10 pointer-events-none z-[9999] hidden lg:block"
      >
        {/* Central Core Point */}
        <motion.div 
            animate={{ scale: isHovering ? 0.5 : 1, opacity: isHovering ? 1 : 1 }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#00FF9D] rounded-full shadow-[0_0_10px_#00FF9D] transition-colors ${isHovering ? 'bg-white' : 'bg-[#00FF9D]'}`}
        />

        {/* 4 Corners (Precision Frame) */}
        {[0, 90, 180, 270].map((rotation) => (
          <motion.div
            key={rotation}
            animate={{ 
                rotate: rotation,
                x: isHovering ? (rotation === 90 || rotation === 180 ? 12 : -12) : 0,
                y: isHovering ? (rotation === 180 || rotation === 270 ? 12 : -12) : 0,
                opacity: isHovering ? 1 : 0.4
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 border-t-2 border-l-2 border-[#00FF9D]"
            style={{ 
                borderRadius: '2px 0 0 0',
                borderColor: isHovering ? '#FFF' : '#00FF9D'
            }}
          />
        ))}

        {/* Interactive Ring */}
        <motion.div
            animate={{ 
                scale: isHovering ? 1.5 : 0,
                opacity: isHovering ? 0.2 : 0,
                borderWidth: isHovering ? '1px' : '0px'
            }}
            className="absolute inset-0 rounded-full border-[#00FF9D] bg-[#00FF9D]/10 blur-[2px]"
        />
      </motion.div>

      {/* Subtle Distance Glow (Smaller than previous Spotlight) */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-45%',
          translateY: '-45%',
        }}
        className={`fixed top-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none z-[9998] hidden lg:block transition-all duration-700 ${isHovering ? 'bg-[#3B82F6]/10' : 'bg-[#00FF9D]/5'}`}
      />
    </>
  );
};

export default CustomCursor;
