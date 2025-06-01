"use client"

import { useTheme } from "../context/ThemeContext"
import { useAccessibility } from "../context/AccessibilityContext"

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, projectTitle }) => {
  const { darkMode } = useTheme()
  const { getContrastTheme } = useAccessibility()

  // Theme classes with contrast support
  const theme = getContrastTheme(darkMode)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="flex items-center justify-center min-h-screen">
        <div className={`fixed inset-0 ${theme.overlay}`} aria-hidden="true" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-auto my-8 shadow-xl z-50">
          <div className={`${theme.modal} px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg`}>
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className={`text-lg leading-6 font-medium ${theme.text.primary}`} id="modal-title">
                  Eliminar proyecto
                </h3>
                <div className="mt-2">
                  <p className={`text-sm ${theme.text.secondary}`}>
                    ¿Estás seguro de que deseas eliminar el proyecto{" "}
                    <span className="font-medium">{projectTitle || "seleccionado"}</span>? Esta acción no se puede
                    deshacer.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium sm:ml-3 sm:w-auto sm:text-sm ${theme.button.primary}`}
                onClick={onConfirm}
              >
                Eliminar
              </button>
              <button
                type="button"
                className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 text-base font-medium sm:mt-0 sm:w-auto sm:text-sm ${theme.button.secondary}`}
                onClick={onClose}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal
