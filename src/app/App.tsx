import { RouterProvider } from 'react-router';
import { Providers } from '@/app/providers';
import { ErrorBoundary } from '@/app/error-boundary';
import { router } from '@/app/router';

export function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </ErrorBoundary>
  );
}
