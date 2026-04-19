import { Component, type ErrorInfo, type ReactNode } from 'react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isProd } from '@/lib/env';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Uncaught error in React tree', {
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  handleReset = (): void => this.setState({ error: null });

  render(): ReactNode {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

export function RootErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <ErrorFallback
        title={`${error.status} — ${error.statusText}`}
        message={error.data as string | undefined}
      />
    );
  }

  const err = error instanceof Error ? error : new Error('Error desconocido');
  return <ErrorFallback error={err} />;
}

interface FallbackProps {
  error?: Error;
  title?: string;
  message?: string;
  onReset?: () => void;
}

function ErrorFallback({ error, title, message, onReset }: FallbackProps) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="border-destructive/30 bg-destructive/10 text-destructive mx-auto flex h-14 w-14 items-center justify-center rounded-full border">
          <AlertTriangle className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h1 className="font-sans text-3xl font-semibold tracking-tight">
            {title ?? 'Algo salió mal'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {message ?? 'Ocurrió un error inesperado. Intenta recargar la página.'}
          </p>
          {!isProd && error && (
            <pre className="bg-muted/40 text-muted-foreground mt-4 overflow-auto rounded-md border p-3 text-left text-xs">
              {error.message}
            </pre>
          )}
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Recargar
          </Button>
          {onReset ? (
            <Button onClick={onReset}>Reintentar</Button>
          ) : (
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Inicio
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
