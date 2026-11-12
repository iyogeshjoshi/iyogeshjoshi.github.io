import React from 'react';

export interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error(error, info.componentStack);
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            padding: 'var(--space-9) var(--gutter)',
            textAlign: 'center',
          }}
        >
          <h1>Something went wrong</h1>
          <p>This page hit an unexpected error. Please try again.</p>
          <p>
            <a href="/">Back to the catalog</a>
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
