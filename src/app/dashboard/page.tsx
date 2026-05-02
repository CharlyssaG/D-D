'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  description: string;
  dm_id: string;
  created_at: string;
}

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  campaign_id: string;
  hp_current: number;
  hp_max: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadData();
    }
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);

    // Load campaigns (as DM)
    const { data: campaignData } = await supabase
      .from('campaigns')
      .select('*')
      .eq('dm_id', user!.id)
      .order('created_at', { ascending: false });

    if (campaignData) setCampaigns(campaignData);

    // Load characters
    const { data: characterData } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (characterData) setCharacters(characterData);

    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-medium font-heading text-xl">Loading your adventures...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-accent-amber/30">
        <Link href="/" className="font-accent text-xl text-accent-burgundy">Campaign Manager</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-medium font-heading">
            {user?.user_metadata?.display_name || user?.email}
          </span>
          <button onClick={signOut} className="text-sm text-ink-light hover:text-accent-burgundy transition-colors">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto w-full p-6">
        <h1 className="chapter-heading mb-8">Your Adventures</h1>

        {/* Campaigns Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-heading font-semibold text-ink-dark">
              Campaigns (as DM)
            </h2>
            <Link href="/campaign/create" className="btn-primary text-sm">
              New Campaign
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="card-parchment text-center py-12">
              <p className="text-ink-medium mb-4">You haven&apos;t created any campaigns yet.</p>
              <Link href="/campaign/create" className="btn-secondary">
                Create Your First Campaign
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaign/${campaign.id}`}
                  className="card-parchment hover:shadow-raised transition-shadow cursor-pointer"
                >
                  <h3 className="text-xl font-heading font-semibold text-ink-dark mb-2">
                    {campaign.name}
                  </h3>
                  <p className="text-sm text-ink-medium mb-3">
                    {campaign.description || 'No description yet'}
                  </p>
                  <p className="text-xs text-ink-light">
                    Created {new Date(campaign.created_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Characters Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-heading font-semibold text-ink-dark">
              Your Characters
            </h2>
            <Link href="/character/create" className="btn-primary text-sm">
              New Character
            </Link>
          </div>

          {characters.length === 0 ? (
            <div className="card-parchment text-center py-12">
              <p className="text-ink-medium mb-4">You haven&apos;t created any characters yet.</p>
              <Link href="/character/create" className="btn-secondary">
                Create Your First Character
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((char) => {
                const hpPercent = Math.round((char.hp_current / char.hp_max) * 100);
                return (
                  <Link
                    key={char.id}
                    href={`/character/${char.id}`}
                    className="card-parchment hover:shadow-raised transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="portrait-frame w-14 h-14 flex-shrink-0">
                        <div className="w-full h-full bg-accent-amber/20 flex items-center justify-center">
                          <span className="text-xl font-accent text-ink-medium">
                            {char.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-ink-dark">
                          {char.name}
                        </h3>
                        <p className="text-sm text-ink-medium">
                          Lvl {char.level} {char.race} {char.class}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-ink-medium mb-1">
                        <span>HP</span>
                        <span>{char.hp_current}/{char.hp_max}</span>
                      </div>
                      <div className="hp-bar">
                        <div
                          className={`hp-bar-fill ${hpPercent > 50 ? 'healthy' : hpPercent > 25 ? 'wounded' : 'critical'}`}
                          style={{ width: `${Math.min(hpPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
