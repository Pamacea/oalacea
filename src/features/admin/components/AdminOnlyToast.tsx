'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { createContext, useContext, useState, ReactNode } from 'react';

type ToastContextType = {
  showToast: () => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useAdminToast() {
  return useContext(ToastContext);
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);

  const showToast = () => {
    setShow(true);
    setTimeout(() => setShow(false), 2000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-red-500/90 backdrop-blur-sm border border-red-400 rounded-lg shadow-lg">
              <Lock className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white">Admin uniquement</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}
