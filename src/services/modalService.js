import { ref } from 'vue'

// Usage Examples:
//
// Basic usage:
// const { confirm } = useModal()
// const result = await confirm({ message: 'Are you sure?' })
// if (result) { /* user confirmed */ }
//
// Custom usage:
// const result = await confirm({
//   title: 'Delete User',
//   message: 'Are you sure you want to delete this user? This action cannot be undone.',
//   confirmButtonText: 'Delete',
//   cancelButtonText: 'Cancel'
// })

const show = ref(false)
const title = ref('')
const message = ref('')
const confirmButtonText = ref('Confirm')
const cancelButtonText = ref('Cancel')

let resolvePromise = null

export function useModal() {
  const confirmAction = () => {
    return new Promise((resolve) => {
      show.value = true
      resolvePromise = resolve
    })
  }

  const handleConfirm = () => {
    show.value = false
    if (resolvePromise) {
      resolvePromise(true)
    }
  }

  const handleCancel = () => {
    show.value = false
    if (resolvePromise) {
      resolvePromise(false)
    }
  }

  const setContent = (options) => {
    title.value = options.title || 'Confirm Action'
    message.value = options.message || 'Are you sure you want to proceed?'
    confirmButtonText.value = options.confirmButtonText || 'Confirm'
    cancelButtonText.value = options.cancelButtonText || 'Cancel'
  }

  return {
    show,
    title,
    message,
    confirmButtonText,
    cancelButtonText,
    confirm: (options = {}) => {
      setContent(options)
      return confirmAction()
    },
    handleConfirm,
    handleCancel,
  }
}
