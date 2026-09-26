import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import Navbar from '../components/Navbar';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import HistoryPage from '../pages/HistoryPage';
import ReviewPage from '../pages/ReviewPage';
import PrivacyPage from '../pages/PrivacyPage';
import { getInitialData, fetchRecommendations } from '../services/api';
import './legacy.css';

// The previous single-page app, kept reachable at /legacy while the guided
// journey replaces it screen by screen.
export default function LegacyApp() {
  const initial = getInitialData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(initial.profile);
  const [historyList, setHistoryList] = useState(initial.history);
  const [recommendations, setRecommendations] = useState([]);
  const [engineError, setEngineError] = useState(null);
  const [reviewStatus, setReviewStatus] = useState(initial.reviewStatus);

  // Re-evaluate recommendations when profile or history changes
  useEffect(() => {
    let cancelled = false;
    fetchRecommendations(profile, historyList)
      .then((recs) => {
        if (cancelled) return;
        setRecommendations(recs);
        setEngineError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setRecommendations([]);
        setEngineError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [profile, historyList]);

  const handleSaveProfile = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  const handleAddHistoryRecord = (newRecord) => {
    setHistoryList((prev) => [newRecord, ...prev]);
  };

  const handleDeleteHistoryRecord = (recordId) => {
    setHistoryList((prev) => prev.filter((r) => r.id !== recordId));
  };

  const handleSaveReview = (updatedReview) => {
    setReviewStatus(updatedReview);
  };

  return (
    <div className="legacy-shell min-h-screen text-slate-900 flex flex-col">
      <p className="border-b border-rule bg-paper px-4 py-2 text-center text-sm text-ink-2">
        You’re viewing the previous version of this app. <Link to="/">Go to the new guided journey</Link>
      </p>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {engineError && (
        <div role="alert" className="max-w-6xl mx-auto mt-6 w-full px-4">
          <p className="border-y border-rule py-4 text-sm text-stop">
            Recommendations are unavailable: {engineError} Start the backend with{' '}
            <code className="data">uvicorn app.main:app</code> from the <code className="data">backend</code> folder.
          </p>
        </div>
      )}

      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <DashboardPage
            profile={profile}
            recommendations={recommendations}
            reviewStatus={reviewStatus}
            onTabChange={setActiveTab}
          />
        )}
        {activeTab === 'profile' && (
          <ProfilePage profile={profile} onSaveProfile={handleSaveProfile} />
        )}
        {activeTab === 'history' && (
          <HistoryPage
            historyList={historyList}
            onAddRecord={handleAddHistoryRecord}
            onDeleteRecord={handleDeleteHistoryRecord}
          />
        )}
        {activeTab === 'review' && (
          <ReviewPage
            profile={profile}
            historyList={historyList}
            recommendations={recommendations}
            reviewStatus={reviewStatus}
            onSaveReview={handleSaveReview}
          />
        )}
        {activeTab === 'privacy' && <PrivacyPage />}
      </main>

      <footer className="border-t border-slate-200 text-slate-500 py-5 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4">
          Synthetic data only. Rule sources are being re-verified; see the new journey for cited guidance.
        </div>
      </footer>
    </div>
  );
}
