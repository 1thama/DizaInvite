import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Editor from './components/Editor';
import InvitationView from './components/InvitationView';
import CMS from './components/CMS';
import ConsumerLogin from './components/ConsumerLogin';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<ConsumerLogin />} />
        <Route path="/create" element={<Editor />} />
        <Route path="/v/:slug" element={<InvitationView />} />
        <Route path="/admin" element={<CMS onClose={() => window.location.href = '/'} />} />
        {/* Fallback for old links or direct IDs */}
        <Route path="/invitation/:slug" element={<InvitationView />} />
      </Routes>
    </Router>
  );
}
