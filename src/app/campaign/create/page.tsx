'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateCampaignPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return router.push('/login');

    setLoading(true);
    setError('');

    const { data, error: dbError } = await supabase
      .from('campaigns')
      .insert({
        dm_id: user.id,
        name,
        description,
      })
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
    } else {
      // Add the DM as a campaign member
      await supabase.from('campaign_members').insert({
        campaign_id: data.id,
        user_id: user.id,
        role: 'dm',
      });
      router.push(`/campaign/${data.id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-accent-amber/30">
        <Link href="/" className="font-accent text-xl text-accent-burgundy">Campaign Manager</Link>
        <Link href="/dashboard" className="text-sm text-ink-medium hover:text-ink-dark transition-colors font-heading">
          Back to Dashboard
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card-parchment corner-flourish max-w-lg w-full">
          <h1 className="chapter-heading mb-2">Forge a New Campaign</h1>
          <p className="text-center text-ink-medium mb-8">
            Name your world and invite your players
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-heading font-semibold text-ink-dark mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-parchment"
                placeholder="The Lost Mines of Phandelver..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-heading font-semibold text-ink-dark mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-parchment min-h-[120px]"
                placeholder="A brief summary of your campaign setting and story hook..."
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
              className="btn-primary w-full"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
