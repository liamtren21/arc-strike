import React from 'react';
import { ArcStrikeGame } from './components/ArcStrikeGame';

export const App: React.FC = () => {
  return (
    <main className="min-h-screen bg-stone-950 flex flex-col justify-center py-6 px-2 sm:px-4">
      <ArcStrikeGame />
      <footer className="mt-4 text-center text-xs text-stone-600 font-mono">
        ARC STRIKE // TESLA OVERLOAD • Built for Chain Jam Vol. 1 (@chain/casino-sdk ICasinoGameV2) • Certified 96.0000% RTP
      </footer>
    </main>
  );
};

export default App;
