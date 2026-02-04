import React, { useState } from 'react';
import type { User } from '@app-types/user.types';

export function AuthModal({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login
    const user = {
      uid: 'mock-user-' + Math.random().toString(36).substr(2, 5),
      email: email || 'guest@example.com',
      isAnonymous: !email
    };
    localStorage.setItem('mock-user', JSON.stringify(user));
    onLogin(user);
  };

  const handleGuest = () => {
    const user = {
      uid: 'guest-' + Math.random().toString(36).substr(2, 5),
      isAnonymous: true
    };
    localStorage.setItem('mock-user', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="fixed inset-0 bg-navy flex items-center justify-center p-4 z-[200]">
      <div className="bg-cream w-full max-w-md rounded-3xl shadow-2xl border-8 border-blue-400 p-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-navy tracking-tighter">WELCOME CHEF!</h2>
          <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mt-2">Sign in to track your progress</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl border-4 border-gray-200 focus:border-blue-400 outline-none transition-colors"
              placeholder="chef@kitchen.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl border-4 border-gray-200 focus:border-blue-400 outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-navy text-white rounded-xl font-black text-xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:bg-blue-900 active:translate-y-1 active:shadow-none transition-all"
          >
            {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-xs font-bold text-gray-400 uppercase">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <button
          onClick={handleGuest}
          className="w-full mt-6 py-4 bg-white text-navy border-4 border-navy rounded-xl font-black text-xl hover:bg-gray-100 transition-all"
        >
          CONTINUE AS GUEST
        </button>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 font-bold hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
