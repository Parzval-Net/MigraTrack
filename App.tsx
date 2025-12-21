
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import TriggerMapScreen from './screens/TriggerMapScreen';
import CalendarScreen from './screens/CalendarScreen';
import StartLogScreen from './screens/StartLogScreen';
import CrisisDetailsScreen from './screens/CrisisDetailsScreen';
import ProtectorsMapScreen from './screens/ProtectorsMapScreen';
import BiofeedbackScreen from './screens/BiofeedbackScreen';
import ReportScreen from './screens/ReportScreen';
import ProfileScreen from './screens/ProfileScreen';
import AIChatScreen from './screens/AIChatScreen';
import ImageAnalysisScreen from './screens/ImageAnalysisScreen';
import OnboardingScreen from './screens/OnboardingScreen';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark shadow-xl relative overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/triggers" element={<TriggerMapScreen />} />
          <Route path="/calendar" element={<CalendarScreen />} />
          <Route path="/crisis-log" element={<StartLogScreen />} />
          <Route path="/crisis-details" element={<CrisisDetailsScreen />} />
          <Route path="/protectors" element={<ProtectorsMapScreen />} />
          <Route path="/biofeedback" element={<BiofeedbackScreen />} />
          <Route path="/report" element={<ReportScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/chat" element={<AIChatScreen />} />
          <Route path="/analyze" element={<ImageAnalysisScreen />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
