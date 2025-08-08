import { useToast } from 'vue-toastification'

const toast = useToast()

/**
 * Shows a success toast notification.
 * @param {string} message - The message to display.
 */
export function showSuccess(message) {
  toast.success(message)
}

/**
 * Shows an error toast notification.
 * @param {string} message - The message to display.
 */
export function showError(message) {
  toast.error(message)
}

// You can add more types like showInfo or showWarning here in the future if needed.

export default {
  success: showSuccess,
  error: showError,
}
