import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { loginApi } from '../services/authService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import { Shield, Lock, User, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, isInitializing, checkAuth } = useAuthStore();
  const { toast } = useToast();

  const [username, setUsername] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const [rememberMe, setRememberMeState] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { user, accessToken, refreshToken } = await loginApi(username.trim(), password.trim());
      setAuth(user, accessToken, refreshToken, rememberMe);
      toast.success(`Welcome back, ${user.firstName || user.username}!`, 'Login Successful');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check credentials.';
      setError(msg);
      toast.error(msg, 'Authentication Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-gray-50 to-brand-100/30 dark:from-gray-950 dark:via-gray-900 dark:to-brand-950/20 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700/80 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/30 mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">SprintDesk</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sprint Management Dashboard for Software Development Teams
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800 text-xs text-brand-900 dark:text-brand-200 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Demo Credentials (DummyJSON):</span>
            <div className="font-mono text-[11px] mt-0.5 opacity-90">
              Username: <span className="font-bold">emilys</span> | Password: <span className="font-bold">emilyspass</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError('');
            }}
            leftIcon={<User className="w-4 h-4" />}
            placeholder="Enter username"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            leftIcon={<Lock className="w-4 h-4" />}
            placeholder="Enter password"
            showPasswordStrength
            required
          />

          {error && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>}

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMeState(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span>Remember me (30 days)</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full shadow-md"
          >
            Sign In to Workspace
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
