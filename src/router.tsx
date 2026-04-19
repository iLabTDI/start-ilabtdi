import { createBrowserRouter } from 'react-router';
import { AppShell } from '@/components/app-shell';
import { ProtectedRoute } from '@/components/protected-route';
import { PublicOnlyRoute } from '@/components/public-only-route';
import { RootErrorBoundary } from '@/components/error-boundary';
import { PublicHome } from '@/pages/home/public-home';
import { AppHome } from '@/pages/home/app-home';
import { Docs, DocsIndexRedirect } from '@/pages/docs/docs';
import { Login } from '@/pages/auth/login';
import { Register } from '@/pages/auth/register';
import { ForgotPassword } from '@/pages/auth/forgot-password';
import { ResetPassword } from '@/pages/auth/reset-password';
import { VerifyEmail } from '@/pages/auth/verify-email';
import { Profile } from '@/pages/account/profile';
import { Settings } from '@/pages/account/settings';
import { NotFound } from '@/pages/not-found';

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RootErrorBoundary />,
    children: [
      { index: true, element: <PublicHome /> },

      // Documentación — pública, no requiere login
      { path: 'docs', element: <DocsIndexRedirect /> },
      { path: 'docs/:slug', element: <Docs /> },

      {
        element: <PublicOnlyRoute />,
        children: [
          { path: 'login', element: <Login /> },
          { path: 'register', element: <Register /> },
          { path: 'forgot-password', element: <ForgotPassword /> },
          { path: 'reset-password', element: <ResetPassword /> },
          { path: 'verify-email', element: <VerifyEmail /> },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: 'home', element: <AppHome /> },
              { path: 'profile', element: <Profile /> },
              { path: 'settings', element: <Settings /> },
            ],
          },
        ],
      },

      { path: '*', element: <NotFound /> },
    ],
  },
]);
