'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-accent-amber/30">
        <Link href="/" className="font-accent text-xl text-accent-burgundy">Campaign Manager</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card-parchment corner-flourish max-w-md w-full">
          <h1 className="chapter-heading mb-2">Welcome Back</h1>
          <p className="text-center text-ink-medium mb-8">Sign in to continue your adventure</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-heading font-semibold text-ink-dark mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-parchment"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-heading font-semibold text-ink-dark mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-parchment"
                placeholder="Your password"
                required
              />
            </div>

            {error && (
              <div className="bg-accent-burgundy/10 text-accent-burgundy text-sm px-4 py-3 rounded-lg border border-accent-burgundy/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="divider-ornate" />

          <p className="text-center text-sm text-ink-medium">
            New to the realm?{' '}
            <Link href="/signup" className="wiki-link font-semibold">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
