import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

type AuthState = {
  token: string;
  role: 'ADMIN' | 'USER';
  name: string;
} | null;

export default function App() {
  const [auth, setAuth] = useState<AuthState>(null);
  const [view, setView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const savedAuth = localStorage.getItem('collabspace_auth');
    if (savedAuth) {
      try {
        setAuth(JSON.parse(savedAuth));
      } catch (e) {
        localStorage.removeItem('collabspace_auth');
      }
    }
    setIsInitializing(false);
  }, []);

  const handleLoginSuccess = (data: { token: string; role: 'ADMIN' | 'USER'; name: string }) => {
    setAuth(data);
    localStorage.setItem('collabspace_auth', JSON.stringify(data));
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('collabspace_auth');
    setView('LOGIN');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (auth) {
    return <Dashboard user={auth} onLogout={handleLogout} />;
  }

  return (
    <Layout title={view === 'LOGIN' ? 'Welcome Back' : 'Join the Team'}>
      {view === 'LOGIN' ? (
        <Login 
          onSuccess={handleLoginSuccess} 
          onSwitchToRegister={() => setView('REGISTER')} 
        />
      ) : (
        <Register 
          onSuccess={() => setView('LOGIN')} 
          onSwitchToLogin={() => setView('LOGIN')} 
        />
      )}
    </Layout>
  );
}
