import { useEffect, useState } from 'react';
import { LogOut, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import AdminDashboard from './AdminDashboard';

interface DashboardProps {
  user: { name: string; role: 'ADMIN' | 'USER'; token: string };
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  // If user is ADMIN, render the new Admin Dashboard
  if (user.role === 'ADMIN') {
    return <AdminDashboard user={user} onLogout={onLogout} />;
  }

  // --- User Dashboard Logic (Existing) ---
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/user/dashboard', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          onLogout();
          return;
        }
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Navbar */}
      <nav className="border-bottom border-white/5 bg-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">CollabSpace</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-white/80">{user.name}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-white/40 border border-white/10 px-1.5 rounded">
                  {user.role}
                </span>
              </div>
              
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold mb-2"
          >
            Welcome Back
          </motion.h2>
          <p className="text-white/40">
            Access your team projects and collaboration tools.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-white/40 animate-pulse">Loading secure data...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={fetchData}
              className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <UserIcon className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Welcome, {user.name}!</h3>
                <p className="text-white/40 max-w-md mx-auto">
                  You are currently logged in as a standard user. You have access to team collaboration tools and project boards.
                </p>
                <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-[10px] uppercase text-white/40">Projects</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="text-2xl font-bold">4</div>
                    <div className="text-[10px] uppercase text-white/40">Teams</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="text-2xl font-bold">28</div>
                    <div className="text-[10px] uppercase text-white/40">Tasks</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar / Stats */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                <h4 className="font-bold mb-1">System Status</h4>
                <p className="text-white/80 text-sm mb-4">All services are operational.</p>
                <div className="flex items-center gap-2 text-xs font-medium bg-black/20 w-fit px-2 py-1 rounded">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Uptime: 99.9%
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h4 className="font-semibold mb-4">Recent Activity</h4>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-1 h-auto bg-white/10 rounded-full" />
                      <div>
                        <p className="text-sm text-white/80">Security audit completed</p>
                        <p className="text-[10px] text-white/40 uppercase">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
