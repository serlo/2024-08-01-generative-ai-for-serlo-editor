import React, { Component, ReactNode } from 'react'

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: unknown) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, info)
  }

  render() {
    if (this.state.error !== null) {
      // You can render any custom fallback UI
      return (
        <p>
          <b>Something went wrong:</b> {this.state.error.message}
        </p>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
