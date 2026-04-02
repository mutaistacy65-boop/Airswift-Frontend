import React from 'react'

interface ModalProps {
  isOpen: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm sm:max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="p-4 sm:p-6">
          {children}
        </div>
        <div className="p-4 sm:p-6 border-t flex flex-col gap-2 sm:flex-row sm:gap-4 sm:justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm sm:text-base"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="w-full sm:w-auto order-1 sm:order-2 px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 text-sm sm:text-base"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Modal