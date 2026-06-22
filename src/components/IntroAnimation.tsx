import { motion } from 'motion/react';
import { Briefcase } from 'lucide-react';
import React, { useEffect } from 'react';

export const IntroAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    // End the intro animation after 3.2 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const title = "Work Tracker GR";
  const letters = Array.from(title);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.6 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.5,
      filter: "blur(10px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral-950 overflow-hidden"
      exit={{ 
        opacity: 0, 
        scale: 0.95, 
        filter: "blur(20px)",
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
      }}
    >
      {/* Glowing animated background */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0, 0.15, 0] }}
        transition={{ duration: 3, ease: "easeInOut", times: [0, 0.5, 1] }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#00ffcc] blur-[120px] rounded-full pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated Icon Container */}
        <motion.div
          initial={{ scale: 0, rotate: -45, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.2
          }}
          className="w-24 h-24 bg-neutral-900 border border-neutral-800 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(0,255,204,0.15)] relative overflow-hidden"
        >
           {/* Shimmer Effect */}
           <motion.div 
             initial={{ y: "100%" }}
             animate={{ y: "-100%" }}
             transition={{
               duration: 2,
               repeat: Infinity,
               repeatType: "loop",
               ease: "linear"
             }}
             className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"
           />
          <Briefcase className="w-10 h-10 text-white relative z-10" />
        </motion.div>

        {/* Staggered Text Reveal */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex space-x-[2px] items-center"
        >
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              variants={child}
              className={`text-4xl md:text-5xl font-display tracking-tight ${
                letter === ' ' ? 'w-3' : ''
              } ${
                index >= 13 ? 'text-[#00ffcc] font-bold' : 'text-neutral-200 font-medium'
              }`}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
        
        {/* Sleek Loading Bar */}
        <div className="w-48 h-0.5 bg-neutral-900 rounded-full overflow-hidden mt-8 relative">
          <motion.div
            initial={{ width: 0, x: "-100%" }}
            animate={{ width: "100%", x: "0%" }}
            transition={{ delay: 0.8, duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 h-full bg-gradient-to-r from-cyan-500 to-[#00ffcc] rounded-full shadow-[0_0_10px_#00ffcc]"
          />
        </div>
      </div>
    </motion.div>
  );
}
