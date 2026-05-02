'use client';

import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-medium font-heading text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav Bar */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-accent-amber/30">
        <Link href="/" className="font-accent text-xl text-accent-burgundy">Campaign Manager</Link>
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="btn-secondary text-sm py-2 px-4">
              My Campaigns
            </Link>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">
              Log In
            </Link>
            <Link href="/signup" className="btn-primary text-sm py-2 px-4">
              Sign Up
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card-parchment corner-flourish max-w-2xl w-full">
          <h1 className="chapter-heading mb-8">
            Welcome to Your Campaign
          </h1>

          <div className="prose-readable mx-auto">
            <p className="text-lg text-center mb-8">
              A beginner-friendly D&D campaign manager designed for players who find
              D&D Beyond overwhelming. Track characters, run combat, manage your
              campaign wiki, and share epic adventures.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
              <div className="bg-parchment-light rounded-lg p-5 border-2 border-accent-amber/30">
                <h3 className="font-heading font-semibold text-ink-dark text-lg mb-3">
                  For Players
                </h3>
                <ul className="text-sm text-ink-medium space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-burgundy mt-0.5">&#9670;</span>
                    Full character creation wizard
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-burgundy mt-0.5">&#9670;</span>
                    Live character sheets
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-burgundy mt-0.5">&#9670;</span>
                    Inventory &amp; spell management
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-burgundy mt-0.5">&#9670;</span>
                    Private notes &amp; campaign wiki
                  </li>
                </ul>
              </div>

              <div className="bg-parchment-light rounded-lg p-5 border-2 border-accent-amber/30">
                <h3 className="font-heading font-semibold text-ink-dark text-lg mb-3">
                  For Dungeon Masters
                </h3>
                <ul className="text-sm text-ink-medium space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-forest mt-0.5">&#9670;</span>
                    Combat tracker &amp; initiative
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-forest mt-0.5">&#9670;</span>
                    Battle maps with tokens
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-forest mt-0.5">&#9670;</span>
                    NPC manager &amp; stat blocks
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-forest mt-0.5">&#9670;</span>
                    Campaign wiki &amp; session logs
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4 justify-center mt-8">
              {user ? (
                <>
                  <Link href="/character/create" className="btn-primary">
                    Create Character
                  </Link>
                  <Link href="/campaign/create" className="btn-secondary">
                    Start Campaign (DM)
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signup" className="btn-primary">
                    Create Your Account
                  </Link>
                  <Link href="/login" className="btn-secondary">
                    Already Have One? Log In
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="divider-ornate" />

          <p className="text-center text-sm text-ink-light mt-4">
            Built with love for new adventurers and experienced DMs alike
          </p>
        </div>
      </div>
    </div>
  );
}
