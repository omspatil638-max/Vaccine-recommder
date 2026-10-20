import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AppLayout from './layouts/AppLayout';
import WizardLayout from './layouts/WizardLayout';
import { GuestOnly, IntakeGate, RequireAuth, RequireOnboarded } from './components/Guards';
import Home from './pages/Home';
import AgeGroupsPage from './pages/AgeGroupsPage';
import MensHealthPage from './pages/MensHealthPage';
import WomensHealthPage from './pages/WomensHealthPage';
import HealthConditionsPage from './pages/HealthConditionsPage';
import VaccineLibraryPage from './pages/VaccineLibraryPage';
import VaccineDetailPage from './pages/VaccineDetailPage';
import AwarenessGuidePage from './pages/AwarenessGuidePage';
import DoctorChecklistPage from './pages/DoctorChecklistPage';
import FaqPage from './pages/FaqPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import PosterLandingPage from './pages/PosterLandingPage';
import ClinicPosterPage from './pages/ClinicPosterPage';
import RemindersPage from './pages/RemindersPage';
import VaccineFinderPage from './pages/VaccineFinderPage';
import NotFoundPage from './pages/NotFoundPage';
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage } from './pages/public/AuthPages';
import SourcesPage from './pages/public/SourcesPage';
import ProfileStep from './features/intake/ProfileStep';
import LocationStep from './features/intake/LocationStep';
import HealthStep from './features/intake/HealthStep';
import HistoryStep from './features/intake/HistoryStep';
import SafetyStep from './features/intake/SafetyStep';
import ReviewStep from './features/intake/ReviewStep';
import HomePage from './pages/app/HomePage';
import RecommendationsPage from './pages/app/RecommendationsPage';
import { SafetyPage, ClinicalReviewPage } from './pages/app/SafetyPages';
import { ProvidersPage, ProviderPage } from './pages/app/ProviderPages';
import SchedulePage from './pages/app/SchedulePage';
import NotificationsPage from './pages/app/NotificationsPage';
import HistoryPage from './pages/app/HistoryPage';
import { ProfilePage, SettingsPage } from './pages/app/AccountPages';
import { RecordPage, AftercarePage } from './pages/app/RecordPages';
import { VaccineLayout, VaccineOverview, VaccineSafety, VaccineSchedule } from './pages/app/VaccinePages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'age-groups', element: <AgeGroupsPage /> },
      { path: 'age-groups/:group', element: <AgeGroupsPage /> },
      { path: 'mens-health', element: <MensHealthPage /> },
      { path: 'womens-health', element: <WomensHealthPage /> },
      { path: 'health-conditions', element: <HealthConditionsPage /> },
      { path: 'vaccine-library', element: <VaccineLibraryPage /> },
      { path: 'vaccine-library/:id', element: <VaccineDetailPage /> },
      { path: 'vaccine-finder', element: <VaccineFinderPage /> },
      { path: 'awareness-guide', element: <AwarenessGuidePage /> },
      { path: 'doctor-checklist', element: <DoctorChecklistPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'about/sources', element: <SourcesPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'reminders', element: <RemindersPage /> },
      { path: 'poster-landing', element: <PosterLandingPage /> },
      { path: 'categories', element: <PosterLandingPage /> },
      { path: 'clinic-poster', element: <ClinicPosterPage /> },
      { path: 'scan', element: <Navigate to="/poster-landing" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <GuestOnly />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <WizardLayout />,
        children: [{
          element: <IntakeGate />,
          children: [
            { path: '/start/profile', element: <ProfileStep /> },
            { path: '/start/location', element: <LocationStep /> },
            { path: '/start/health', element: <HealthStep /> },
            { path: '/start/history', element: <HistoryStep /> },
            { path: '/start/safety', element: <SafetyStep /> },
            { path: '/start/review', element: <ReviewStep /> },
          ],
        }],
      },
      {
        element: <RequireOnboarded />,
        children: [{
          element: <AppLayout />,
          children: [
            { path: '/home', element: <HomePage /> },
            { path: '/recommendations', element: <RecommendationsPage /> },
            { path: '/safety', element: <SafetyPage /> },
            { path: '/review', element: <ClinicalReviewPage /> },
            { path: '/providers', element: <ProvidersPage /> },
            { path: '/providers/:providerId', element: <ProviderPage /> },
            { path: '/schedule', element: <SchedulePage /> },
            { path: '/notifications', element: <NotificationsPage /> },
            { path: '/history', element: <HistoryPage /> },
            { path: '/profile', element: <ProfilePage /> },
            { path: '/settings', element: <SettingsPage /> },
            { path: '/record', element: <RecordPage /> },
            { path: '/record/:recordId/aftercare', element: <AftercarePage /> },
            { path: '/vaccines/:vaccineId', element: <VaccineLayout />, children: [
              { index: true, element: <VaccineOverview /> },
              { path: 'safety', element: <VaccineSafety /> },
              { path: 'schedule', element: <VaccineSchedule /> },
            ] },
            { path: '/account/alerts', element: <Navigate to="/notifications" replace /> },
            { path: '*', element: <NotFoundPage /> },
          ],
        }],
      },
    ],
  },
], { basename: import.meta.env.BASE_URL });
