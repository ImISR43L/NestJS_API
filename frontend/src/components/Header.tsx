// frontend/src/components/Header.tsx
import React from 'react';

interface HeaderProps {
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onLogout }) => {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid #ccc',
      }}
    >
      <h1>Habit Pet</h1>
      <nav style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => onNavigate('habits')}>Habits</button>
        <button onClick={() => onNavigate('dailies')}>Dailies</button>
        <button onClick={() => onNavigate('todos')}>To-Dos</button>
        <button onClick={() => onNavigate('groups')}>Groups</button>
        <button onClick={() => onNavigate('challenges')}>Challenges</button>
        <button onClick={() => onNavigate('pet')}>Pet</button>{' '}
        <button onClick={onLogout} style={{ marginLeft: '20px' }}>
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;
