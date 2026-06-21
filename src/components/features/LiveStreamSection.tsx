'use client';

import { useState } from 'react';
import { Tv, MonitorPlay } from 'lucide-react';
import { LiveTVClient } from '@/components/features/LiveTVClient';
import { Button } from '@/components/ui/button';

export function LiveStreamSection() {
  const [showIPTV, setShowIPTV] = useState(false);

  return (
    <div className="mb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Tv className="w-6 h-6 text-primary" />
          Live TV Streams
        </h2>
        <Button 
          variant="outline" 
          onClick={() => setShowIPTV(!showIPTV)}
          className="w-full md:w-auto flex items-center gap-2"
        >
          <MonitorPlay className="w-4 h-4" />
          {showIPTV ? 'Show Primary Stream' : 'Show IPTV Channels'}
        </Button>
      </div>

      {showIPTV ? (
        <LiveTVClient />
      ) : (
        <div className="w-full bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[70vh] min-h-[600px] mb-12 items-center justify-center text-center p-8">
           <MonitorPlay className="w-20 h-20 text-muted-foreground mb-6 opacity-20" />
           <h3 className="text-2xl font-bold mb-4">External Stream Selected</h3>
           <p className="text-muted-foreground max-w-md mb-8">
             This stream provider (LiveKhelaTV) doesn't allow embedding on other websites. You'll need to open it in a new tab to watch.
           </p>
           <a 
             href="https://livekhelatv.com/" 
             target="_blank" 
             rel="noopener noreferrer"
             className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl font-bold flex items-center gap-2 text-lg shadow-lg hover:scale-105 transition-transform"
           >
             <MonitorPlay className="w-5 h-5" />
             Watch on LiveKhelaTV
           </a>
        </div>
      )}
    </div>
  );
}
