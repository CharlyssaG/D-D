# D&D Campaign Manager

A beginner-friendly digital D&D campaign tool with storybook aesthetic. Built for players who find D&D Beyond overwhelming.

## Features

### For Players
- **Character Creation**: Full 5e character builder with step-by-step guidance
- **Character Sheet**: Live-updating stats, HP tracking, spell slots
- **Inventory Management**: Drag-and-drop equipment, weight tracking, attunement slots
- **Private Notes**: Backstory, secrets, goals (shareable with DM)
- **Wiki Contributions**: Add lore, NPCs, locations collaboratively

### For Dungeon Masters
- **DM Screen**: See all player characters at a glance
- **Combat Tracker**: Auto-sorted initiative, HP syncing, condition tracking
- **NPC Manager**: Quick templates, stat blocks, portraits
- **Battle Maps**: Upload images, place tokens, fog of war, grid overlay
- **Campaign Wiki**: Collaborative knowledge base with version history
- **Session Logs**: Auto-generated summaries, XP tracking, loot distribution

### Dual-Mode Sessions
- **In-Person**: DM screen on laptop, players use phones
- **Remote**: Shared battle map + Discord voice

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Deployment**: Vercel
- **Version Control**: Git

## Design Philosophy

**Storybook Aesthetic**
- Warm parchment backgrounds
- Serif headings (Crimson Text)
- Clean sans-serif body (Inter)
- Ornamental borders and flourishes
- Oval portrait frames
- Torn paper edges on cards

**Readability First**
- 16px minimum body text
- 65-character line length max
- 1.75 line height
- High contrast text
- No tiny labels or cramped interfaces

## Getting Started

### Prerequisites
- Node.js 18+
- Git
- Supabase account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd dnd-campaign-manager
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref <your-project-ref>

# Push database migrations
supabase db push

# Generate TypeScript types
npm run generate-types
```

4. **Configure environment variables**

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deployment

**Deploy to Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Database Schema

### Core Tables
- `profiles` - User accounts (extends Supabase auth)
- `campaigns` - D&D campaigns
- `characters` - Player characters (full 5e data)
- `npcs` - Non-player characters
- `combat_sessions` - Active battles
- `battle_maps` - Map images + token positions
- `wiki_pages` - Campaign knowledge base
- `character_notes` - Private player notes
- `session_logs` - Auto-generated recaps

### Realtime Features
- HP changes sync instantly
- Initiative order updates
- Token movement on battle maps
- Wiki edits (collaborative editing)

## File Upload System

**Storage Buckets:**
- `character-portraits/` - Player avatars (max 2MB, auto-compress to 512x512)
- `battle-maps/` - DM-uploaded maps (max 10MB)
- `wiki-images/` - Campaign lore images
- `tokens/` - Custom battle tokens (64x64 thumbnails)

**Upload Flow:**
1. Client-side image preview
2. Crop tool for portraits (circle/square)
3. Auto-compression
4. Upload to Supabase Storage
5. URL saved to database
6. Realtime update to all viewers

## Wiki System

**Categories:**
- **Locations**: Cities, dungeons, taverns
- **NPCs**: Allies, villains, merchants
- **Factions**: Guilds, kingdoms, organizations
- **Items**: Magic items, artifacts
- **Lore**: World history, legends
- **Session Recaps**: Auto-generated from each session

**Features:**
- Rich text editor (TipTap)
- Inline image uploads
- @mentions for linking
- Version history
- DM-only pages (marked with wax seal)
- Collaborative editing

**Auto-Generation:**
- Combat ends → create session recap stub
- NPC introduced → prompt to add to wiki
- Loot acquired → auto-add items with timestamp

## Animation Guidelines

**Animated:**
- Token movement (300ms ease-out)
- HP bar changes (color shift)
- Dice rolls (3D bounce)
- Initiative reordering
- Spell slot depletion

**Instant:**
- Page transitions
- Modal/dialog appearance
- Tab switches

**Performance:**
- Use `transform` and `opacity` only
- Avoid layout thrashing
- GPU-accelerated animations

## Development Roadmap

### Phase 1: MVP (Weeks 1-3)
- [ ] User authentication
- [ ] Character creation wizard
- [ ] Basic character sheet
- [ ] DM screen with character list
- [ ] Simple combat tracker

### Phase 2: Battle Maps (Weeks 4-5)
- [ ] Image upload for maps
- [ ] Token drag-and-drop
- [ ] Grid overlay
- [ ] Realtime position sync
- [ ] Fog of war

### Phase 3: Polish (Ongoing)
- [ ] Spell database (SRD integration)
- [ ] Automated roll modifiers
- [ ] 3D dice animations
- [ ] Condition auto-effects
- [ ] Wiki knowledge graph
- [ ] Session recap templates

## Contributing

This is a personal project, but suggestions are welcome! Open an issue to discuss major changes.

## License

MIT

## Acknowledgments

- D&D 5e System Reference Document (SRD)
- Crimson Text font by Sebastian Kosch
- Inter font by Rasmus Andersson
- Inspiration from classic D&D rulebooks and illuminated manuscripts
