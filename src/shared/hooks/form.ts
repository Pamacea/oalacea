"use client"

import { useState } from 'react'

export function useFormState<T>(
  initialState: T,
  onSubmit: (data: T) => void | Promise<void>
) {
  const [data, setData] = useState<T>(initialState)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    setData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [field]: _omitted, ...rest } = prev
        return rest as Partial<Record<keyof T, string>>
      })
    }
  }

  const setError = <K extends keyof T>(field: K, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }))
  }

  const clearErrors = () => setErrors({})

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      setErrors({})
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    data,
    errors,
    isSubmitting,
    updateField,
    setError,
    clearErrors,
    handleSubmit,
    setData,
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T) => {
    setStoredValue(value)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value))
    }
  }

  return [storedValue, setValue] as const
}
