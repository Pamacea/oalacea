"use client"

import React from "react"

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">Something went wrong</h2>
            <p className="text-sm text-zinc-500 mb-4">
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

interface ThreeErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ThreeErrorBoundary({ children, fallback }: ThreeErrorBoundaryProps) {
  const defaultFallback = (
    <div className="flex items-center justify-center h-full bg-zinc-900/50">
      <div className="text-center">
        <p className="text-zinc-400 text-sm">3D scene unavailable</p>
        <p className="text-zinc-600 text-xs mt-1">Please refresh the page</p>
      </div>
    </div>
  )

  return (
    <ErrorBoundary
      fallback={fallback ?? defaultFallback}
      onError={(error) => {
        console.error('[ThreeErrorBoundary] 3D scene error:', error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
