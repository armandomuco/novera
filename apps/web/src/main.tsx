import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles/index.css';

const AcceptInvitationPage = lazy(() =>
  import('./pages/AcceptInvitationPage').then((module) => ({
    default: module.AcceptInvitationPage,
  })),
);
const AppShell = lazy(() =>
  import('./pages/AppShell').then((module) => ({ default: module.AppShell })),
);
const DemoRequestPage = lazy(() =>
  import('./pages/DemoRequestPage').then((module) => ({ default: module.DemoRequestPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('./pages/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })),
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const PricingPage = lazy(() =>
  import('./pages/PricingPage').then((module) => ({ default: module.PricingPage })),
);
const SignupPage = lazy(() =>
  import('./pages/SignupPage').then((module) => ({ default: module.SignupPage })),
);
const ResetPasswordPage = lazy(() =>
  import('./pages/ResetPasswordPage').then((module) => ({
    default: module.ResetPasswordPage,
  })),
);
const VerifyEmailPage = lazy(() =>
  import('./pages/VerifyEmailPage').then((module) => ({ default: module.VerifyEmailPage })),
);

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/accept-invitation', element: <AcceptInvitationPage /> },
  { path: '/request-demo', element: <DemoRequestPage /> },
  { path: '/pricing', element: <PricingPage /> },
  { path: '/app', element: <AppShell /> },
]);

export function RouteLoadingState() {
  return (
    <div className="page-canvas flex min-h-screen items-center justify-center text-sm font-semibold text-slate-600">
      Loading Novera...
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<RouteLoadingState />}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>,
);
