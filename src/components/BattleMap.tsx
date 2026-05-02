'use client';

import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';

interface Token {
  id: string;
  entityId: string;
  entityType: 'character' | 'npc';
  name: string;
  imageUrl?: string;
  x: number;
  y: number;
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
}

interface BattleMapProps {
  mapId: string;
  imageUrl: string;
  gridSize: number; // feet per square
  isDM: boolean;
}

const SIZE_TO_SQUARES = {
  tiny: 0.5,
  small: 1,
  medium: 1,
  large: 2,
  huge: 3,
  gargantuan: 4,
};

export default function BattleMap({ mapId, imageUrl, gridSize = 5, isDM }: BattleMapProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const mapRef = useRef<HTMLDivElement>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [draggingToken, setDraggingToken] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Subscribe to realtime token updates
  useEffect(() => {
    const channel = supabase
      .channel(`battle-map-${mapId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battle_maps',
          filter: `id=eq.${mapId}`,
        },
        (payload) => {
          if (payload.new && payload.new.token_positions) {
            updateTokensFromDB(payload.new.token_positions);
          }
        }
      )
      .subscribe();

    // Load initial token positions
    loadTokens();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mapId]);

  const loadTokens = async () => {
    const { data, error } = await supabase
      .from('battle_maps')
      .select('token_positions')
      .eq('id', mapId)
      .single();

    if (data?.token_positions) {
      updateTokensFromDB(data.token_positions);
    }
  };

  const updateTokensFromDB = (positions: any) => {
    const tokenArray: Token[] = Object.entries(positions).map(([id, data]: [string, any]) => ({
      id,
      entityId: data.entityId,
      entityType: data.entityType,
      name: data.name,
      imageUrl: data.imageUrl,
      x: data.x,
      y: data.y,
      size: data.size || 'medium',
    }));
    setTokens(tokenArray);
  };

  const handleTokenMouseDown = (tokenId: string, e: React.MouseEvent) => {
    if (!isDM) return; // Only DM can move tokens

    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggingToken(tokenId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingToken || !mapRef.current) return;

    const mapRect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - mapRect.left - dragOffset.x;
    const y = e.clientY - mapRect.top - dragOffset.y;

    // Snap to grid
    const gridPixels = 50; // Assuming 50px per grid square
    const snappedX = Math.round(x / gridPixels) * gridPixels;
    const snappedY = Math.round(y / gridPixels) * gridPixels;

    setTokens(prev =>
      prev.map(t =>
        t.id === draggingToken
          ? { ...t, x: snappedX, y: snappedY }
          : t
      )
    );
  };

  const handleMouseUp = async () => {
    if (!draggingToken) return;

    // Save to database (triggers realtime update for other clients)
    const updatedPositions = tokens.reduce((acc, token) => {
      acc[token.id] = {
        entityId: token.entityId,
        entityType: token.entityType,
        name: token.name,
        imageUrl: token.imageUrl,
        x: token.x,
        y: token.y,
        size: token.size,
      };
      return acc;
    }, {} as any);

    await supabase
      .from('battle_maps')
      .update({ token_positions: updatedPositions })
      .eq('id', mapId);

    setDraggingToken(null);
  };

  const getTokenSize = (size: string) => {
    const squares = SIZE_TO_SQUARES[size as keyof typeof SIZE_TO_SQUARES] || 1;
    return squares * 50; // 50px per square
  };

  return (
    <div className="relative">
      {/* Controls */}
      {isDM && (
        <div className="card-parchment mb-4 flex gap-4 items-center">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className="btn-secondary"
          >
            {showGrid ? 'Hide' : 'Show'} Grid
          </button>
          <span className="text-sm text-ink-medium">
            Grid: {gridSize}ft squares
          </span>
        </div>
      )}

      {/* Battle Map */}
      <div 
        ref={mapRef}
        className="relative overflow-hidden rounded-ornate shadow-raised"
        style={{
          border: '8px solid #8B7355',
          boxShadow: '0 0 0 4px #5C4033, 0 8px 24px rgba(43, 24, 16, 0.3)',
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Map Image */}
        <div className="relative">
          <Image
            src={imageUrl}
            alt="Battle map"
            width={1200}
            height={800}
            className="w-full h-auto"
            priority
          />

          {/* Grid Overlay */}
          {showGrid && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ opacity: 0.3 }}
            >
              <defs>
                <pattern
                  id="grid"
                  width="50"
                  height="50"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 50 0 L 0 0 0 50"
                    fill="none"
                    stroke="rgba(43, 24, 16, 0.4)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          )}

          {/* Tokens */}
          {tokens.map((token) => {
            const size = getTokenSize(token.size);
            return (
              <div
                key={token.id}
                className={`battle-token ${draggingToken === token.id ? 'z-50' : 'z-10'}`}
                style={{
                  left: `${token.x}px`,
                  top: `${token.y}px`,
                  width: `${size}px`,
                  height: `${size}px`,
                }}
                onMouseDown={(e) => handleTokenMouseDown(token.id, e)}
              >
                {token.imageUrl ? (
                  <div className="portrait-frame w-full h-full">
                    <Image
                      src={token.imageUrl}
                      alt={token.name}
                      width={size}
                      height={size}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-full rounded-full border-4 border-accent-gold flex items-center justify-center text-parchment-light font-heading font-bold shadow-raised"
                    style={{
                      backgroundColor: token.entityType === 'character' ? '#2D5016' : '#7A2828',
                      fontSize: `${size / 3}px`,
                    }}
                  >
                    {token.name.substring(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Token Name Label */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="bg-ink-dark/80 text-parchment-light px-2 py-1 rounded text-xs font-semibold">
                    {token.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distance Measurement Tool */}
      {isDM && (
        <div className="card-parchment mt-4">
          <p className="text-sm text-ink-medium">
            <span className="font-semibold">DM Tools:</span> Click and drag tokens to move them. 
            Grid squares represent {gridSize}ft each.
          </p>
        </div>
      )}
    </div>
  );
}
