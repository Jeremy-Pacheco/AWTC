import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<Props> = ({ open, title, message, confirmText = 'Yes', cancelText = 'No', danger = false, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <motion.div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ duration: 0.3, type: "spring", stiffness: 120 }}>
            {title && <h3 className="text-xl font-bold mb-2">{title}</h3>}
            {message && <p className="mb-4 text-sm text-gray-700">{message}</p>}
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-[#1f2124] hover:text-white transition">{cancelText}</button>
              <button onClick={onConfirm} className={`px-4 py-2 rounded-lg transition font-semibold ${danger ? 'bg-red-500 text-white hover:bg-[#1f2124]' : 'bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white'}`}>{confirmText}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
