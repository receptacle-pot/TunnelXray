import { useState, useEffect } from 'react';
import { Scene as ParticleScene } from './components/Scene';
import { LoginCard, type UserProfile } from './components/LoginCard';
import { HomePage } from './components/HomePage';
import { SiteFooter } from './components/SiteFooter';
import { KineticInteractionLayer } from './components/KineticInteractionLayer';
import './App.css';
import './components/TransparentTheme.css';

const STORAGE_KEY = 'tunnelxray_session_user';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  // Check persisted login state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogin = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <>
      {/* Universal Kinetic Interaction Layer (Smooth Cursor Proximity, Trail Wake & Click Ripple) */}
      <KineticInteractionLayer />

      {/* If user is authenticated, open the new Home Page with AnimatedTopDock */}
      {user ? (
        <HomePage user={user} onLogout={handleLogout} />
      ) : (
        <main className="viewport-container">
          {/* ThreeUI StructureFlow canonical background */}
          <ParticleScene />

          {/* Transparent Glassmorphic Login Card */}
          <LoginCard onLoginSuccess={handleLogin} />
        </main>
      )}

      {/* Global Footer all over the website */}
      <SiteFooter />
    </>
  );
}

