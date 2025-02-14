"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

interface ConfirmationAnimationProps {
  status: "waiting" | "success" | "error";
}

export default function ConfirmationAnimation({
  status,
}: ConfirmationAnimationProps) {
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (status !== "waiting") {
      const timer = setTimeout(() => setShowResult(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowResult(false);
    }
  }, [status]);

  const dotVariants = {
    start: {
      y: "0%",
    },
    end: {
      y: "100%",
    },
  };

  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut",
  };

  return (
    <div className="flex items-center justify-center w-32 h-32">
      <AnimatePresence mode="wait">
        {status === "waiting" && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex space-x-2"
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-4 h-4 bg-blue-500 rounded-full"
                variants={dotVariants}
                transition={{
                  ...dotTransition,
                  delay: index * 0.15,
                }}
                animate="end"
                initial="start"
              />
            ))}
          </motion.div>
        )}
        {status === "success" && showResult && (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-24 h-24"
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-green-500"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-white"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              <Check size={40} strokeWidth={3} />
            </motion.div>
          </motion.div>
        )}
        {status === "error" && showResult && (
          <motion.div
            key="error"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-24 h-24"
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-white"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              <X size={40} strokeWidth={3} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
