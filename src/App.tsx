import React, { Component, type ReactNode } from 'react';
import LegacyApp from './LegacyApp';
import { AuthProvider } from './app/context/AuthContext';
import { ThemeProvider } from './app/context/ThemeContext';
import { LanguageProvider } from './app/context/LanguageContext';
import { ToastProvider } from './app/context/ToastContext';
import { DialogProvider } from './app/context/DialogContext';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Uncaught runtime error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl mb-2">
            ⚠️
          </div>
          <h1 className="text-xl font-bold">GoobJoog Application Recovered</h1>
          <p className="text-xs text-slate-400 max-w-md">
            A temporary session state conflict occurred. Tap below to refresh your workspace.
          </p>
          {this.state.error && (
            <div className="p-3 bg-black/60 border border-rose-500/30 rounded-xl text-rose-300 text-[10px] font-mono max-w-md w-full overflow-x-auto text-left">
              <span className="font-bold block mb-1">Error Diagnostic Info:</span>
              <span>{this.state.error.toString()}</span>
              {this.state.error.stack && (
                <span className="block mt-1 text-[9px] text-slate-400 opacity-80 whitespace-pre-wrap">
                  {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                </span>
              )}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95"
          >
            Reset Session & Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <DialogProvider>
              <AuthProvider>
                <LegacyApp />
              </AuthProvider>
            </DialogProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
