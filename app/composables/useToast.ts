
export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
    id: string
    type: ToastType
    title?: string
    message: string
    timeout?: number
    createdAt: number
}

/**
 * Shared toasts state (Nuxt useState so it works across the app and SSR-safe)
 */
export const useToastsState = () => useState<Toast[]>('toasts', () => [])

/**
 * Composable providing toast helpers: show, success, error, info, warning, remove
 */
export function useToast() {
    const toasts = useToastsState()

    const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    function remove(id: string) {
        toasts.value = toasts.value.filter((t) => t.id !== id)
    }

    function show(message: string, opts?: Partial<Toast> & { type?: ToastType }): string {
        const id = (opts && (opts as any).id) || generateId()
        const toast: Toast = {
            id,
            type: opts?.type ?? 'info',
            title: opts?.title,
            message,
            timeout: typeof opts?.timeout === 'number' ? opts!.timeout : 5000,
            createdAt: Date.now(),
        }

        // Append immutably to keep reactivity predictable
        toasts.value = [...toasts.value, toast]

        // Auto-remove after timeout on the client
        if (typeof window !== 'undefined' && toast.timeout && toast.timeout > 0) {
            setTimeout(() => {
                remove(id)
            }, toast.timeout)
        }

        return id
    }

    const success = (message: string, opts?: Partial<Toast>) => show(message, { ...(opts as any), type: 'success' })
    const error = (message: string, opts?: Partial<Toast>) => show(message, { ...(opts as any), type: 'error' })
    const info = (message: string, opts?: Partial<Toast>) => show(message, { ...(opts as any), type: 'info' })
    const warning = (message: string, opts?: Partial<Toast>) => show(message, { ...(opts as any), type: 'warning' })

    return {
        toasts,
        show,
        success,
        error,
        info,
        warning,
        remove,
    }
}
