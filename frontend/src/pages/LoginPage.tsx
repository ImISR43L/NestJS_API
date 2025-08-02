import React, { useState } from 'react';
import apiClient from '../api/axiosConfig';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  switchToRegister: () => void;
}

interface LoginResponse {
  user: User;
  accessToken: string;
}

const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  switchToRegister,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      const { accessToken, user } = response.data;

      // --- DEBUGGING LOG ---
      // This will confirm we received the token and are saving it.
      console.log('Login Success: Saving token to localStorage:', accessToken);
      localStorage.setItem('accessToken', accessToken);

      onLoginSuccess(user);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Welcome Back!</h2>
      <form onSubmit={handleLogin}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password-login">Password</label>
          <input
            id="password-login"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Don't have an account?{' '}
        <button onClick={switchToRegister}>Register here</button>
      </p>
    </div>
  );
};

export default LoginPage;
