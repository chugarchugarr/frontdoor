import React, { type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type RootErrorBoundaryProps = {
  children: ReactNode;
};

type RootErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

// Lightweight inline error boundary for wrapping individual views
type ErrorBoundaryState = { hasError: boolean; error: Error | null };
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error): ErrorBoundaryState { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error("[ErrorBoundary]", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF", fontFamily: "Inter, sans-serif" }}>
          <div style={{ maxWidth: 400, padding: "40px 32px", border: "1px solid #E5E5E5", borderRadius: 16, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0A0A0A", marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ fontSize: 13, color: "#737373", marginBottom: 24 }}>{this.state.error?.message || "An unexpected error occurred."}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ padding: "10px 24px", background: "#2A5240", color: "#FFFFFF", border: "none", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export class RootErrorBoundary extends React.Component<
  RootErrorBoundaryProps,
  RootErrorBoundaryState
> {
  state: RootErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { hasError: true, error };
  }

  private get isInsideIframe(): boolean {
    return typeof window !== "undefined" && window.self !== window.top;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      "Fatal: Root error boundary caught an error:",
      error,
      errorInfo,
    );
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleTryAgain = () => {
    this.setState({ hasError: false, error: null });
  };

  handleFixErrors = () => {
    window.parent.postMessage("fixErrors", "*");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <div className="mx-4 max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-destructive">Oops!</h1>
            <p className="mt-2 text-foreground">
              An unexpected error occurred while rendering the app
            </p>

            {this.state.error && (
              <p className="mt-2 truncate text-sm text-muted-foreground">
                {this.state.error.message}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {this.isInsideIframe ? (
                <Button
                  type="button"
                  onClick={this.handleFixErrors}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Fix the errors
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={this.handleRefresh}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Refresh page
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={this.handleTryAgain}
                className="border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                Try again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
