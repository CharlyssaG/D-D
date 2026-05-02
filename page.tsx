export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card-parchment corner-flourish max-w-2xl">
        <h1 className="chapter-heading mb-8">
          Welcome to Your Campaign
        </h1>
        
        <div className="prose-readable">
          <p className="text-lg mb-6">
            A beginner-friendly D&D campaign manager designed for players who find 
            D&D Beyond overwhelming. Track characters, run combat, manage your 
            campaign wiki, and share epic adventures.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            <div className="bg-parchment-light rounded-lg p-4 border-2 border-accent-amber/30">
              <h3 className="font-heading font-semibold text-ink-dark mb-2">
                For Players
              </h3>
              <ul className="text-sm text-ink-medium space-y-1 list-disc list-inside">
                <li>Full character creation</li>
                <li>Live character sheets</li>
                <li>Inventory management</li>
                <li>Private notes</li>
              </ul>
            </div>

            <div className="bg-parchment-light rounded-lg p-4 border-2 border-accent-amber/30">
              <h3 className="font-heading font-semibold text-ink-dark mb-2">
                For Dungeon Masters
              </h3>
              <ul className="text-sm text-ink-medium space-y-1 list-disc list-inside">
                <li>Combat tracker</li>
                <li>Battle maps with tokens</li>
                <li>NPC manager</li>
                <li>Campaign wiki</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-8">
            <button className="btn-primary">
              Create Character
            </button>
            <button className="btn-secondary">
              Start Campaign (DM)
            </button>
          </div>
        </div>

        <div className="divider-ornate" />
        
        <p className="text-center text-sm text-ink-light mt-4">
          Built with love for new adventurers and experienced DMs alike
        </p>
      </div>
    </div>
  );
}
