'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createClient } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Tab = 'party' | 'npcs' | 'wiki' | 'combat';

export default function CampaignPage() {
  const { user } = useAuth();
  const params = useParams();
  const supabase = createClient();
  const [campaign, setCampaign] = useState<Record<string, any> | null>(null);
  const [characters, setCharacters] = useState<Record<string, any>[]>([]);
  const [npcs, setNpcs] = useState<Record<string, any>[]>([]);
  const [wikiPages, setWikiPages] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('party');
  const [selectedWikiPage, setSelectedWikiPage] = useState<Record<string, any> | null>(null);
  const [selectedNpc, setSelectedNpc] = useState<Record<string, any> | null>(null);
  const [wikiFilter, setWikiFilter] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    loadCampaign();
  }, [params.id]);

  const loadCampaign = async () => {
    const { data: campaignData } = await supabase
      .from('campaigns').select('*').eq('id', params.id).single();

    if (campaignData) setCampaign(campaignData);

    const { data: charData } = await supabase
      .from('characters').select('*').eq('campaign_id', params.id);
    if (charData) setCharacters(charData);

    const { data: npcData } = await supabase
      .from('npcs').select('*').eq('campaign_id', params.id).order('name');
    if (npcData) setNpcs(npcData);

    const { data: wikiData } = await supabase
      .from('wiki_pages').select('*').eq('campaign_id', params.id).order('category').order('title');
    if (wikiData) setWikiPages(wikiData);

    setLoading(false);
  };

  const isDM = campaign?.dm_id === user?.id;
  const getMod = (score: number) => { const m = Math.floor((score - 10) / 2); return m >= 0 ? `+${m}` : `${m}`; };

  const wikiCategories = Array.from(new Set(wikiPages.map(p => p.category).filter(Boolean)));
  const filteredWiki = wikiFilter ? wikiPages.filter(p => p.category === wikiFilter) : wikiPages;

  // Render wiki content from TipTap JSON
  const renderContent = (content: any): string => {
    if (!content || !content.content) return '';
    return content.content.map((node: any) => {
      if (node.type === 'heading') {
        const text = node.content?.map((c: any) => c.text).join('') || '';
        return text;
      }
      if (node.type === 'paragraph') {
        return node.content?.map((c: any) => c.text).join('') || '';
      }
      return '';
    }).filter(Boolean).join('\n\n');
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

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'party', label: 'Party', count: characters.length },
    { key: 'npcs', label: 'NPCs', count: npcs.length },
    { key: 'wiki', label: 'Wiki', count: wikiPages.length },
    { key: 'combat', label: 'Combat' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-accent-amber/30">
        <Link href="/" className="font-accent text-xl text-accent-burgundy">Campaign Manager</Link>
        <div className="flex items-center gap-4">
          {isDM && <span className="condition-badge positive">Dungeon Master</span>}
          <Link href="/dashboard" className="text-sm text-ink-medium hover:text-ink-dark transition-colors font-heading">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto w-full p-6">
        {/* Campaign Header */}
        <div className="card-parchment corner-flourish mb-6">
          <h1 className="chapter-heading mb-2">{campaign.name}</h1>
          {campaign.description && (
            <p className="text-center text-ink-medium max-w-xl mx-auto mb-4">{campaign.description}</p>
          )}
          {isDM && (
            <div className="flex justify-center">
              <button onClick={() => setShowInvite(!showInvite)} className="btn-secondary text-sm">
                {showInvite ? 'Hide' : 'Show'} Campaign ID
              </button>
            </div>
          )}
          {showInvite && (
            <div className="mt-4 bg-parchment-light rounded-lg p-4 border-2 border-accent-amber/30 max-w-md mx-auto">
              <p className="text-sm text-ink-medium mb-2 text-center">Share this ID with players:</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-parchment-dark rounded px-3 py-2 text-sm font-mono text-ink-dark text-center break-all">{campaign.id}</code>
                <button onClick={() => navigator.clipboard.writeText(campaign.id)} className="btn-secondary text-sm py-2">Copy</button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedWikiPage(null); setSelectedNpc(null); }}
              className={`px-5 py-2 font-heading font-semibold rounded-lg transition-all text-sm ${
                activeTab === tab.key
                  ? 'bg-accent-burgundy text-parchment-light shadow-raised'
                  : 'bg-parchment text-ink-dark border-2 border-accent-amber/30 hover:bg-parchment-dark'
              }`}
            >
              {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
            </button>
          ))}
        </div>

        {/* PARTY TAB */}
        {activeTab === 'party' && (
          <div>
            {characters.length === 0 ? (
              <div className="card-parchment text-center py-12">
                <p className="text-ink-medium mb-2">No characters linked to this campaign yet.</p>
                <p className="text-sm text-ink-light">Share your Campaign ID so players can join!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((char) => {
                  const hp = Math.round((char.hp_current / char.hp_max) * 100);
                  const ab = char.ability_scores || {};
                  const pp = 10 + Math.floor(((ab.wis || 10) - 10) / 2);
                  return (
                    <div key={char.id} className="card-parchment">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="portrait-frame w-12 h-12 flex-shrink-0">
                          <div className="w-full h-full bg-accent-amber/20 flex items-center justify-center">
                            <span className="text-lg font-accent text-ink-medium">{char.name?.charAt(0)}</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold text-ink-dark">{char.name}</h3>
                          <p className="text-xs text-ink-medium">Lvl {char.level} {char.race} {char.class}</p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-ink-medium mb-1">
                          <span>HP</span><span>{char.hp_current}/{char.hp_max}</span>
                        </div>
                        <div className="hp-bar">
                          <div className={`hp-bar-fill ${hp > 50 ? 'healthy' : hp > 25 ? 'wounded' : 'critical'}`} style={{ width: `${Math.min(hp, 100)}%` }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="bg-parchment-dark rounded p-2">
                          <div className="font-heading font-semibold text-accent-burgundy">{char.ac}</div>
                          <div className="text-xs text-ink-light">AC</div>
                        </div>
                        <div className="bg-parchment-dark rounded p-2">
                          <div className="font-heading font-semibold text-accent-burgundy">{getMod(ab.dex || 10)}</div>
                          <div className="text-xs text-ink-light">Init</div>
                        </div>
                        <div className="bg-parchment-dark rounded p-2">
                          <div className="font-heading font-semibold text-accent-burgundy">{pp}</div>
                          <div className="text-xs text-ink-light">PP</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* NPCs TAB */}
        {activeTab === 'npcs' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* NPC List */}
            <div className="md:col-span-1">
              <div className="card-parchment">
                <h2 className="text-lg font-heading font-semibold text-ink-dark mb-3 border-b-2 border-accent-amber/30 pb-2">
                  Characters ({npcs.length})
                </h2>
                <div className="space-y-1 max-h-[600px] overflow-y-auto scroll-styled">
                  {npcs.map((npc) => {
                    const role = npc.stat_block?.role || npc.type;
                    return (
                      <button
                        key={npc.id}
                        onClick={() => setSelectedNpc(npc)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                          selectedNpc?.id === npc.id
                            ? 'bg-accent-burgundy/10 border-l-4 border-accent-burgundy'
                            : 'hover:bg-parchment-light'
                        }`}
                      >
                        <div className="font-heading font-semibold text-ink-dark text-sm">{npc.name}</div>
                        <div className="text-xs text-ink-light">{role}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* NPC Detail */}
            <div className="md:col-span-2">
              {selectedNpc ? (
                <div className="card-parchment">
                  <h2 className="text-2xl font-heading font-semibold text-ink-dark mb-1">{selectedNpc.name}</h2>
                  <div className="flex gap-2 mb-4">
                    <span className="condition-badge">{selectedNpc.type}</span>
                    {selectedNpc.stat_block?.role && <span className="condition-badge">{selectedNpc.stat_block.role}</span>}
                  </div>

                  <p className="text-ink-dark mb-4 leading-relaxed">{selectedNpc.description}</p>

                  {selectedNpc.location && (
                    <p className="text-sm text-ink-medium mb-4">
                      <span className="font-semibold">Location:</span> {selectedNpc.location}
                    </p>
                  )}

                  {/* Combat Stats */}
                  {(selectedNpc.hp_max > 0) && (
                    <div className="flex gap-4 mb-4">
                      <div className="bg-parchment-dark rounded-lg px-4 py-2 text-center">
                        <div className="font-heading font-semibold text-accent-burgundy text-xl">{selectedNpc.ac}</div>
                        <div className="text-xs text-ink-light">AC</div>
                      </div>
                      <div className="bg-parchment-dark rounded-lg px-4 py-2 text-center">
                        <div className="font-heading font-semibold text-accent-burgundy text-xl">{selectedNpc.hp_max}</div>
                        <div className="text-xs text-ink-light">HP</div>
                      </div>
                      <div className="bg-parchment-dark rounded-lg px-4 py-2 text-center">
                        <div className="font-heading font-semibold text-accent-burgundy text-xl">{selectedNpc.speed}</div>
                        <div className="text-xs text-ink-light">Speed</div>
                      </div>
                    </div>
                  )}

                  {/* Stat Block Details */}
                  {selectedNpc.stat_block && (
                    <div className="space-y-3">
                      {/* Abilities */}
                      {selectedNpc.stat_block.abilities && (
                        <div>
                          <h3 className="text-sm font-heading font-semibold text-ink-medium mb-2">Ability Scores</h3>
                          <div className="flex gap-2 flex-wrap">
                            {Object.entries(selectedNpc.stat_block.abilities as Record<string, number>).map(([key, val]) => (
                              <div key={key} className="bg-parchment-dark rounded px-3 py-1.5 text-center">
                                <div className="text-xs text-ink-light uppercase">{key}</div>
                                <div className="font-heading font-semibold text-sm">{val} ({getMod(val)})</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Attacks */}
                      {selectedNpc.stat_block.attacks && (
                        <div>
                          <h3 className="text-sm font-heading font-semibold text-ink-medium mb-2">Attacks</h3>
                          <div className="space-y-2">
                            {(selectedNpc.stat_block.attacks as any[]).map((atk: any, i: number) => (
                              <div key={i} className="bg-parchment-light rounded-lg p-3 border border-accent-amber/20">
                                <div className="font-heading font-semibold text-ink-dark">{atk.name}</div>
                                <div className="text-sm text-ink-medium">
                                  {atk.bonus && <span className="mr-3">To Hit: {atk.bonus}</span>}
                                  {atk.damage && <span className="mr-3">Damage: {atk.damage}</span>}
                                  {atk.range && <span>Range: {atk.range}</span>}
                                </div>
                                {atk.special && <div className="text-xs text-accent-burgundy mt-1">{atk.special}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vulnerability / Special */}
                      {selectedNpc.stat_block.vulnerability && (
                        <div className="bg-accent-forest/10 rounded-lg p-3 border border-accent-forest/20">
                          <span className="text-sm font-semibold text-accent-forest">Vulnerability: </span>
                          <span className="text-sm text-ink-dark">{selectedNpc.stat_block.vulnerability}</span>
                        </div>
                      )}

                      {selectedNpc.stat_block.root_weakness && (
                        <div className="bg-accent-amber/10 rounded-lg p-3 border border-accent-amber/30">
                          <span className="text-sm font-semibold text-accent-amber">Root Weakness: </span>
                          <span className="text-sm text-ink-dark">{selectedNpc.stat_block.root_weakness}</span>
                        </div>
                      )}

                      {/* Key Info / Dialogue / Evidence */}
                      {selectedNpc.stat_block.key_info && (
                        <div className="border-t-2 border-accent-amber/20 pt-3">
                          <h3 className="text-sm font-heading font-semibold text-ink-medium mb-1">Key Info</h3>
                          <p className="text-sm text-ink-dark">{selectedNpc.stat_block.key_info}</p>
                        </div>
                      )}

                      {selectedNpc.stat_block.legend && (
                        <div className="border-t-2 border-accent-amber/20 pt-3">
                          <h3 className="text-sm font-heading font-semibold text-ink-medium mb-1">Legend</h3>
                          <p className="text-sm text-ink-dark italic">{selectedNpc.stat_block.legend}</p>
                        </div>
                      )}

                      {selectedNpc.stat_block.rumors && (
                        <div className="border-t-2 border-accent-amber/20 pt-3">
                          <h3 className="text-sm font-heading font-semibold text-ink-medium mb-1">Rumors</h3>
                          <div className="space-y-1">
                            {(selectedNpc.stat_block.rumors as string[]).map((r: string, i: number) => (
                              <p key={i} className="text-sm text-ink-dark">• &ldquo;{r}&rdquo;</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedNpc.stat_block.secret && (
                        <div className="bg-accent-burgundy/5 rounded-lg p-3 border border-accent-burgundy/20 mt-2">
                          <span className="text-sm font-semibold text-accent-burgundy">DM Secret: </span>
                          <span className="text-sm text-ink-dark">{selectedNpc.stat_block.secret}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="card-parchment text-center py-16">
                  <p className="text-ink-medium">Select an NPC to view their details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WIKI TAB */}
        {activeTab === 'wiki' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Wiki List */}
            <div className="md:col-span-1">
              <div className="card-parchment">
                <h2 className="text-lg font-heading font-semibold text-ink-dark mb-3 border-b-2 border-accent-amber/30 pb-2">
                  Campaign Wiki
                </h2>

                {/* Category Filters */}
                <div className="flex gap-1 flex-wrap mb-3">
                  <button
                    onClick={() => setWikiFilter(null)}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-all ${!wikiFilter ? 'bg-accent-burgundy text-parchment-light' : 'bg-parchment-dark text-ink-dark'}`}
                  >
                    All
                  </button>
                  {wikiCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setWikiFilter(cat === wikiFilter ? null : cat)}
                      className={`px-2 py-1 rounded text-xs font-semibold transition-all capitalize ${wikiFilter === cat ? 'bg-accent-burgundy text-parchment-light' : 'bg-parchment-dark text-ink-dark'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="space-y-1 max-h-[600px] overflow-y-auto scroll-styled">
                  {filteredWiki.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => setSelectedWikiPage(page)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                        selectedWikiPage?.id === page.id
                          ? 'bg-accent-burgundy/10 border-l-4 border-accent-burgundy'
                          : 'hover:bg-parchment-light'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {page.dm_only && <span className="text-xs bg-accent-burgundy text-parchment-light px-1.5 py-0.5 rounded font-semibold">DM</span>}
                        <span className="font-heading font-semibold text-ink-dark text-sm">{page.title}</span>
                      </div>
                      <div className="text-xs text-ink-light capitalize">{page.category}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Wiki Content */}
            <div className="md:col-span-2">
              {selectedWikiPage ? (
                <div className="card-parchment relative">
                  {selectedWikiPage.dm_only && <div className="dm-seal" />}
                  <div className="mb-2">
                    <span className="condition-badge capitalize">{selectedWikiPage.category}</span>
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-ink-dark mb-4">{selectedWikiPage.title}</h2>
                  <div className="prose-readable">
                    {selectedWikiPage.content?.content?.map((node: any, i: number) => {
                      if (node.type === 'heading') {
                        const text = node.content?.map((c: any) => c.text).join('') || '';
                        const level = node.attrs?.level || 2;
                        if (level === 2) return <h2 key={i} className="text-xl font-heading font-semibold text-ink-dark mt-6 mb-3 border-b-2 border-accent-amber/30 pb-1">{text}</h2>;
                        return <h3 key={i} className="text-lg font-heading font-semibold text-ink-dark mt-4 mb-2">{text}</h3>;
                      }
                      if (node.type === 'paragraph') {
                        const text = node.content?.map((c: any) => c.text).join('') || '';
                        if (!text) return null;
                        return <p key={i} className="text-ink-dark leading-relaxed mb-3">{text}</p>;
                      }
                      return null;
                    })}
                  </div>
                  <div className="text-xs text-ink-light mt-6 pt-3 border-t border-accent-amber/20">
                    Last updated {new Date(selectedWikiPage.updated_at).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="card-parchment text-center py-16">
                  <p className="text-ink-medium">Select a wiki page to read</p>
                  <p className="text-sm text-ink-light mt-2">{wikiPages.length} pages in this campaign</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* COMBAT TAB */}
        {activeTab === 'combat' && (
          <div className="card-parchment text-center py-12">
            <h2 className="text-xl font-heading font-semibold text-ink-dark mb-2">Combat Tracker</h2>
            <p className="text-ink-medium">Initiative tracker and battle maps coming in the next update!</p>
          </div>
        )}
      </div>
    </div>
  );
}
