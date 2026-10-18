import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import StartPage from './pages/StartPage';
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
import PosterLandingPage from './pages/PosterLandingPage';
import ClinicPosterPage from './pages/ClinicPosterPage';
import RemindersPage from './pages/RemindersPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/', element: <StartPage /> },
  {
    element: <Layout />,
    children: [
      { path: 'home', element: <Home /> },
      { path: 'age-groups', element: <AgeGroupsPage /> },
      { path: 'age-groups/:group', element: <AgeGroupsPage /> },
      { path: 'mens-health', element: <MensHealthPage /> },
      { path: 'womens-health', element: <WomensHealthPage /> },
      { path: 'health-conditions', element: <HealthConditionsPage /> },
      { path: 'vaccine-library', element: <VaccineLibraryPage /> },
      { path: 'vaccine-library/:id', element: <VaccineDetailPage /> },
      { path: 'awareness-guide', element: <AwarenessGuidePage /> },
      { path: 'doctor-checklist', element: <DoctorChecklistPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'reminders', element: <RemindersPage /> },
      { path: 'poster-landing', element: <PosterLandingPage /> },
      { path: 'categories', element: <PosterLandingPage /> },
      { path: 'clinic-poster', element: <ClinicPosterPage /> },
      { path: 'scan', element: <Navigate to="/poster-landing" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
], { basename: import.meta.env.BASE_URL });
