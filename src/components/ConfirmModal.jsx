// ConfirmModal.jsx
import React from "react";

const ConfirmModal = ({ open, onConfirm, onCancel, message, darkMode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className={`rounded-lg shadow-lg p-6 w-full max-w-sm ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
        <h2 className="text-lg font-semibold mb-4">Confirmar acción</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className={`px-4 py-2 rounded ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} transition`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;