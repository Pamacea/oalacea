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
            <div className="flex items-center gap-3 px-4 py-3 bg-imperium-crimson/95 backdrop-blur-sm border-2 border-imperium-crimson rounded-none shadow-[8px_4px_0_rgba(154,17,21,0.4)]">
              <Lock className="h-5 w-5 text-imperium-bone" />
              <span className="font-terminal text-sm font-medium text-imperium-bone">Admin uniquement</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}
