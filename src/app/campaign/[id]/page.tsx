'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createClient } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CampaignPage() {
  const { user } = useAuth();
  const params = useParams();
  const supabase = createClient();
  const [campaign, setCampaign] = useState<Record<string, any> | null>(null);
  const [characters, setCharacters] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    loadCampaign();
  }, [params.id]);

  const loadCampaign = async () => {
    const { data: campaignData } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', params.id)
      .single();

    if (campaignData) {
      setCampaign(campaignData);
      setInviteCode(campaignData.id);
    }

    // Load characters in this campaign
    const { data: charData } = await supabase
      .from('characters')
      .select('*')
      .eq('campaign_id', params.id);

    if (charData) setCharacters(charData);
    setLoading(false);
  };

  const isDM = campaign?.dm_id === user?.id;

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-medium font-heading text-xl">Loading campaign...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-parchment text-center">
          <p className="text-ink-medium mb-4">Campaign not found</p>
          <Link href="/dashboard" className="btn-secondary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-accent-amber/30">
        <Link href="/" className="font-accent text-xl text-accent-burgundy">Campaign Manager</Link>
        <div className="flex items-center gap-4">
          {isDM && <span className="condition-badge positive">Dungeon Master</span>}
          <Link href="/dashboard" className="text-sm text-ink-medium hover:text-ink-dark transition-colors font-heading">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto w-full p-6">
        {/* Campaign Header */}
        <div className="card-parchment corner-flourish mb-8">
          <h1 className="chapter-heading mb-2">{campaign.name}</h1>
          {campaign.description && (
            <p className="text-center text-ink-medium max-w-xl mx-auto">{campaign.description}</p>
          )}

          {isDM && (
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setShowInvite(!showInvite)}
                className="btn-secondary text-sm"
              >
                {showInvite ? 'Hide' : 'Show'} Campaign ID
              </button>
            </div>
          )}

          {showInvite && (
            <div className="mt-4 bg-parchment-light rounded-lg p-4 border-2 border-accent-amber/30 max-w-md mx-auto">
              <p className="text-sm text-ink-medium mb-2 text-center">Share this Campaign ID with your players:</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-parchment-dark rounded px-3 py-2 text-sm font-mono text-ink-dark text-center break-all">
                  {inviteCode}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(inviteCode)}
                  className="btn-secondary text-sm py-2"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-ink-light mt-2 text-center">
                Players can link their characters to this campaign using this ID
              </p>
            </div>
          )}
        </div>

        {/* DM Screen - Party Overview */}
        {isDM && (
          <section className="mb-8">
            <h2 className="text-2xl font-heading font-semibold text-ink-dark mb-4">
              Party Overview (DM Screen)
            </h2>

            {characters.length === 0 ? (
              <div className="card-parchment text-center py-8">
                <p className="text-ink-medium mb-2">No characters linked to this campaign yet.</p>
                <p className="text-sm text-ink-light">Share your Campaign ID with players so they can join!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((char) => {
                  const hpPercent = Math.round((char.hp_current / char.hp_max) * 100);
                  const abilities = char.ability_scores || {};
                  const passivePerception = 10 + Math.floor(((abilities.wis || 10) - 10) / 2);

                  return (
                    <div key={char.id} className="card-parchment">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="portrait-frame w-12 h-12 flex-shrink-0">
                          <div className="w-full h-full bg-accent-amber/20 flex items-center justify-center">
                            <span className="text-lg font-accent text-ink-medium">
                              {char.name?.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold text-ink-dark">{char.name}</h3>
                          <p className="text-xs text-ink-medium">Lvl {char.level} {char.race} {char.class}</p>
                        </div>
                      </div>

                      {/* HP Bar */}
                      <div className="mb-3">
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

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="bg-parchment-dark rounded p-2">
                          <div className="font-heading font-semibold text-accent-burgundy">{char.ac}</div>
                          <div className="text-xs text-ink-light">AC</div>
                        </div>
                        <div className="bg-parchment-dark rounded p-2">
                          <div className="font-heading font-semibold text-accent-burgundy">
                            {getModifier(abilities.dex || 10)}
                          </div>
                          <div className="text-xs text-ink-light">Init</div>
                        </div>
                        <div className="bg-parchment-dark rounded p-2">
                          <div className="font-heading font-semibold text-accent-burgundy">{passivePerception}</div>
                          <div className="text-xs text-ink-light">PP</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-heading font-semibold text-ink-dark mb-4">
            Campaign Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-parchment text-center py-8 opacity-75">
              <h3 className="font-heading font-semibold text-ink-dark mb-2">Combat Tracker</h3>
              <p className="text-sm text-ink-medium">Coming soon</p>
            </div>
            <div className="card-parchment text-center py-8 opacity-75">
              <h3 className="font-heading font-semibold text-ink-dark mb-2">Battle Map</h3>
              <p className="text-sm text-ink-medium">Coming soon</p>
            </div>
            <div className="card-parchment text-center py-8 opacity-75">
              <h3 className="font-heading font-semibold text-ink-dark mb-2">Campaign Wiki</h3>
              <p className="text-sm text-ink-medium">Coming soon</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
