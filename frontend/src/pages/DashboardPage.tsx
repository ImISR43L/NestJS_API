// frontend/src/pages/DashboardPage.tsx
import React, { useState } from 'react';
import { User } from '../types';
import HabitsPage from './HabitsPage';
import DailiesPage from './DailiesPage';
import TodosPage from './TodosPage';
import GroupsPage from './GroupsPage';
import GroupDetailPage from './GroupDetailPage';
import ChallengesPage from './ChallengesPage';
import ChallengeDetailPage from './ChallengeDetailPage';
import PetPage from './PetPage';
import Header from '../components/Header';

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
  refreshUser: () => void;
}

type MainView =
  | 'habits'
  | 'dailies'
  | 'todos'
  | 'groups'
  | 'challenges'
  | 'pet';

const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  onLogout,
  refreshUser,
}) => {
  const [mainView, setMainView] = useState<MainView>('habits');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(
    null,
  );

  const handleNavigation = (view: string) => {
    setMainView(view as MainView);
    setSelectedGroupId(null);
    setSelectedChallengeId(null);
  };

  const renderMainView = () => {
    if (mainView === 'pet') {
      return <PetPage user={user} refreshUser={refreshUser} />;
    }

    if (selectedGroupId) {
      return (
        <GroupDetailPage
          groupId={selectedGroupId}
          onBack={() => setSelectedGroupId(null)}
          currentUser={user}
          refreshUser={refreshUser}
        />
      );
    }

    if (selectedChallengeId) {
      return (
        <ChallengeDetailPage
          challengeId={selectedChallengeId}
          onBack={() => setSelectedChallengeId(null)}
          currentUser={user}
        />
      );
    }

    switch (mainView) {
      case 'habits':
        return <HabitsPage refreshUser={refreshUser} />;
      case 'dailies':
        return <DailiesPage refreshUser={refreshUser} />;
      case 'todos':
        return <TodosPage refreshUser={refreshUser} />;
      case 'groups':
        return (
          <GroupsPage
            onViewGroup={setSelectedGroupId}
            refreshUser={refreshUser}
          />
        );
      case 'challenges':
        return (
          <ChallengesPage
            onViewChallenge={setSelectedChallengeId}
            refreshUser={refreshUser}
          />
        );
      default:
        return <HabitsPage refreshUser={refreshUser} />;
    }
  };

  return (
    <div>
      <Header onNavigate={handleNavigation} onLogout={onLogout} />
      <div className="main-layout">{renderMainView()}</div>
    </div>
  );
};

export default DashboardPage;
