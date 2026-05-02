'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await signUp(email, password, displayName);

    if (signUpError) {
      setError(signUpError);
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
          <h1 className="chapter-heading mb-2">Begin Your Journey</h1>
          <p className="text-center text-ink-medium mb-8">Create an account to start your adventure</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-heading font-semibold text-ink-dark mb-1">
                Character Name (Display Name)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-parchment"
                placeholder="What shall we call you?"
                required
              />
            </div>

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
                placeholder="At least 6 characters"
                required
                minLength={6}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="divider-ornate" />

          <p className="text-center text-sm text-ink-medium">
            Already have an account?{' '}
            <Link href="/login" className="wiki-link font-semibold">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
