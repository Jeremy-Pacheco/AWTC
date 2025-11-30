import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  message?: string;
  onAccept: () => void;
}

const AlertModal: React.FC<Props> = ({ open, message, onAccept }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <motion.div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ duration: 0.3, type: "spring", stiffness: 120 }}>
            {message && <p className="mb-4 text-base">{message}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={onAccept} className="bg-[#F0BB00] px-4 py-2 rounded-3xl hover:bg-[#1f2124] hover:text-white transition font-semibold">Aceptar</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertModal;
