import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import PublicLayout from './layouts/PublicLayout';
import WizardLayout from './layouts/WizardLayout';
import AppLayout from './layouts/AppLayout';
import NotFound from './pages/NotFound';
import LegacyApp from './legacy/LegacyApp';
import { AuthProvider } from './lib/auth';
import { GuestOnly, IndexRedirect, IntakeGate, RequireAuth, RequireOnboarded } from './components/Guards';
import { ForgotPasswordPage, LoginPage, ResetPasswordPage, SignupPage } from './pages/public/AuthPages';
import SourcesPage from './pages/public/SourcesPage';
import DesignSystemPage from './pages/public/DesignSystemPage';
import { IntakeReady } from './features/intake/IntakeContext';
import ProfileStep from './features/intake/ProfileStep';
import LocationStep from './features/intake/LocationStep';
import HealthStep from './features/intake/HealthStep';
import HistoryStep from './features/intake/HistoryStep';
import SafetyStep from './features/intake/SafetyStep';
import ReviewStep from './features/intake/ReviewStep';
import HomePage from './pages/app/HomePage';
import RecommendationsPage from './pages/app/RecommendationsPage';
import { VaccineLayout, VaccineOverview, VaccineSafety, VaccineSchedule } from './pages/app/VaccinePages';
import { ProviderPage, ProvidersPage } from './pages/app/ProviderPages';
import { AftercarePage, RecordPage } from './pages/app/RecordPages';
import SchedulePage from './pages/app/SchedulePage';
import HistoryPage from './pages/app/HistoryPage';
import { ProfilePage, SettingsPage } from './pages/app/AccountPages';
import { ClinicalReviewPage, SafetyPage } from './pages/app/SafetyPages';

const step = (Component) => (
  <IntakeReady>
    <Component />
  </IntakeReady>
);

function Root() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { index: true, element: <IndexRedirect /> },

      {
        element: <PublicLayout />,
        children: [
          {
            element: <GuestOnly />,
            children: [
              { path: 'login', element: <LoginPage /> },
              { path: 'signup', element: <SignupPage /> },
            ],
          },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
          { path: 'about/sources', element: <SourcesPage /> },
          { path: 'design-system', element: <DesignSystemPage /> },
        ],
      },

      {
        element: <RequireAuth />,
        children: [
          {
            path: 'start',
            element: <WizardLayout />,
            children: [
              {
                element: <IntakeGate />,
                children: [
                  { index: true, element: <Navigate to="profile" replace /> },
                  { path: 'profile', element: step(ProfileStep) },
                  { path: 'location', element: step(LocationStep) },
                  { path: 'health', element: step(HealthStep) },
                  { path: 'history', element: step(HistoryStep) },
                  { path: 'safety', element: step(SafetyStep) },
                  { path: 'review', element: step(ReviewStep) },
                ],
              },
            ],
          },
          {
            element: <RequireOnboarded />,
            children: [
              {
                element: <AppLayout />,
                children: [
                  { path: 'home', element: <HomePage /> },
                  { path: 'dashboard', element: <Navigate to="/home" replace /> },
                  { path: 'assessment', element: <Navigate to="/recommendations" replace /> },
                  { path: 'recommendations', element: <RecommendationsPage /> },
                  { path: 'safety', element: <SafetyPage /> },
                  { path: 'review', element: <ClinicalReviewPage /> },
                  {
                    path: 'vaccines/:vaccineId',
                    element: <VaccineLayout />,
                    children: [
                      { index: true, element: <VaccineOverview /> },
                      { path: 'benefits', element: <VaccineOverview /> },
                      { path: 'safety', element: <VaccineSafety /> },
                      { path: 'schedule', element: <VaccineSchedule /> },
                    ],
                  },
                  { path: 'providers', element: <ProvidersPage /> },
                  { path: 'providers/:providerId', element: <ProviderPage /> },
                  { path: 'record', element: <RecordPage /> },
                  { path: 'record/:recordId/aftercare', element: <AftercarePage /> },
                  { path: 'schedule', element: <SchedulePage /> },
                  { path: 'reminders', element: <Navigate to="/schedule" replace /> },
                  { path: 'history', element: <HistoryPage /> },
                  { path: 'profile', element: <ProfilePage /> },
                  { path: 'settings', element: <SettingsPage /> },
                ],
              },
            ],
          },
        ],
      },

      // Previous single-page prototype, kept reachable for comparison.
      { path: 'legacy/*', element: <LegacyApp /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
