'use client';

import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Play, Loader2, Tv, AlertCircle, Volume2 } from 'lucide-react';

interface IPTVChannel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
}

const SPORTS_M3U_URL = 'https://iptv-org.github.io/iptv/categories/sports.m3u';

const EXTRA_CRICKET_CHANNELS = `
#EXTINF:-1 tvg-id="CricketGold.au@SD" tvg-logo="https://resources.cricket-australia.pulselive.com/cricket-australia/photo/2025/07/25/836eddae-4329-4542-ad17-dcd37e9d951a/Cricket-Gold-1920x1080_noBG.png" group-title="Sports",Cricket Gold
https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8
#EXTINF:-1 tvg-id="PTVSports.pk@SD" tvg-logo="https://i.imgur.com/CPm6GHA.png" group-title="Sports",PTV Sports
http://103.250.28.74:8000/play/a019/index.m3u8
#EXTINF:-1 tvg-id="StarSports1.in@SD" tvg-logo="https://i.imgur.com/E5jjKHI.png" group-title="Sports",Star Sports 1
https://tvsen7.aynaott.com/sspts1/index.m3u8
#EXTINF:-1 tvg-id="StarSports1Hindi.in@SD" tvg-logo="https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_STAR_SPORTS_1_HINDI/images/LOGO_HD/image.png" group-title="Sports",Star Sports 1 Hindi
http://103.253.18.58:8000/play/a03o
#EXTINF:-1 tvg-id="StarSports2.in@HD" tvg-logo="https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_STAR_SPORTS_2/images/LOGO_HD/image.png" group-title="Sports",Star Sports 2 HD
https://tvsen7.aynaott.com/ssport2hd/index.m3u8
#EXTINF:-1 tvg-id="StarSports2Hindi.in@HD" tvg-logo="https://i.imgur.com/kHerF19.png" group-title="Sports",Star Sports 2 Hindi HD
http://103.157.248.140:8000/play/a01m/index.m3u8
#EXTINF:-1 tvg-id="TenSportsPakistan.pk@SD" tvg-logo="https://i.imgur.com/nnqpYNm.png" group-title="Sports",Ten Sports Pakistan
http://121.91.61.106:8000/play/a04h/index.m3u8
#EXTINF:-1 tvg-id="WillowSports.us@HD" tvg-logo="https://provider-static.plex.tv/epg/cms/production/acf3d1d8-c53e-49ca-86e9-0d9410b106b4/Willow_Sports_dark_Background_1500_1000_color.png" group-title="Sports",Willow Sports
https://d36r8jifhgsk5j.cloudfront.net/Willow_TV1080p.m3u8
`;

export function LiveTVClient() {
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<IPTVChannel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const CATEGORIES = ['All', 'Football', 'Cricket', 'Motorsport', 'Basketball', 'Tennis', 'Combat'];

  useEffect(() => {
    async function fetchPlaylist() {
      try {
        const response = await fetch(SPORTS_M3U_URL);
        const text = (await response.text()) + '\n' + EXTRA_CRICKET_CHANNELS;
        
        const lines = text.split('\n');
        const parsed: IPTVChannel[] = [];
        let currentChannel: Partial<IPTVChannel> | null = null;

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('#EXTINF:')) {
            currentChannel = {};
            const tvgIdMatch = trimmed.match(/tvg-id="([^"]+)"/);
            if (tvgIdMatch) currentChannel.id = tvgIdMatch[1];
            
            const logoMatch = trimmed.match(/tvg-logo="([^"]+)"/);
            if (logoMatch) currentChannel.logo = logoMatch[1];
            
            const groupMatch = trimmed.match(/group-title="([^"]+)"/);
            if (groupMatch) currentChannel.group = groupMatch[1];
            
            const nameMatch = trimmed.split(',').pop();
            if (nameMatch) currentChannel.name = nameMatch.trim();
            
            if (!currentChannel.id) {
               currentChannel.id = currentChannel.name || Math.random().toString();
            }
          } else if (trimmed.startsWith('http') && currentChannel) {
            currentChannel.url = trimmed;
            parsed.push(currentChannel as IPTVChannel);
            currentChannel = null;
          }
        }
        
        // Remove duplicates and sort
        const uniqueChannels = Array.from(new Map(parsed.map(item => [item.name, item])).values())
            .filter(c => c.name && c.url)
            .sort((a, b) => a.name.localeCompare(b.name));
            
        setChannels(uniqueChannels);
        if (uniqueChannels.length > 0) {
          setActiveChannel(uniqueChannels[0]);
        }
      } catch (err) {
        setError('Failed to load IPTV channels. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlaylist();
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!activeChannel || !videoRef.current) return;

    setIsVideoLoading(true);
    
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(activeChannel.url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsVideoLoading(false);
        videoRef.current?.play().catch(() => {
          // Autoplay might be blocked by browser policy, ignore quietly
        });
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    }
    else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = activeChannel.url;
      videoRef.current.addEventListener('loadedmetadata', () => {
        setIsVideoLoading(false);
        videoRef.current?.play().catch(() => {});
      });
    }
  }, [activeChannel]);

  const filteredChannels = channels.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    
    if (category === 'All') return true;
    
    const searchStr = (c.name + ' ' + (c.group || '')).toLowerCase();
    
    switch(category) {
      case 'Football':
        return searchStr.includes('football') || searchStr.includes('soccer') || searchStr.includes('fifa') || searchStr.includes('premier') || searchStr.includes('laliga');
      case 'Cricket':
        return searchStr.includes('cricket') || searchStr.includes('cric') || searchStr.includes('ipl');
      case 'Motorsport':
        return searchStr.includes('motor') || searchStr.includes('f1') || searchStr.includes('racing') || searchStr.includes('nascar') || searchStr.includes('moto');
      case 'Basketball':
        return searchStr.includes('basket') || searchStr.includes('nba');
      case 'Tennis':
        return searchStr.includes('tennis') || searchStr.includes('atp') || searchStr.includes('wta');
      case 'Combat':
        return searchStr.includes('wwe') || searchStr.includes('ufc') || searchStr.includes('boxing') || searchStr.includes('mma') || searchStr.includes('fight');
      default:
        return true;
    }
  });

  return (
    <div className="w-full bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[70vh] min-h-[600px] mb-12">
      
      {/* Video Player Section */}
      <div className="flex-1 bg-black relative flex flex-col">
        {/* Top Bar overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center pointer-events-none">
           <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
             <span className="font-bold text-white tracking-widest uppercase text-xs">Live TV</span>
           </div>
           {activeChannel && (
             <h2 className="text-white/90 font-medium truncate max-w-[50%]">{activeChannel.name}</h2>
           )}
        </div>

        {/* Video Element */}
        <div className="flex-1 relative">
            <video 
              ref={videoRef}
              className="w-full h-full object-contain bg-black"
              controls
              autoPlay
              playsInline
              crossOrigin="anonymous"
            />
            
            {/* Loading Overlay */}
            {isVideoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white p-6 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold mb-2">Stream Offline</h3>
                <p className="text-white/60">This community stream is currently unavailable. Try another channel.</p>
              </div>
            )}
        </div>
      </div>

      {/* Sidebar Channel List */}
      <div className="w-full md:w-80 lg:w-96 bg-card border-l border-border flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-border bg-muted/20">
          <h3 className="font-black text-lg flex items-center gap-2 mb-3">
            <Tv className="w-5 h-5 text-primary" />
            Sports Channels
          </h3>
          <input 
            type="text" 
            placeholder="Search channels..." 
            className="w-full bg-background border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            suppressHydrationWarning
          />
          
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${category === cat ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1 bg-muted/10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm font-medium">Loading 500+ streams...</span>
            </div>
          ) : filteredChannels.length > 0 ? (
            filteredChannels.map((channel) => {
              const isActive = activeChannel?.id === channel.id;
              return (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${isActive ? 'bg-primary text-primary-foreground shadow-md scale-[0.98]' : 'hover:bg-muted/50 text-foreground'}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${isActive ? 'bg-white' : 'bg-background border border-border'}`}>
                    {channel.logo ? (
                       // eslint-disable-next-line @next/next/no-img-element
                      <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain p-1" onError={(e) => e.currentTarget.style.display = 'none'} />
                    ) : (
                      <Tv className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isActive ? 'text-white' : ''}`}>{channel.name}</p>
                    {channel.group && (
                      <p className={`text-[10px] uppercase tracking-wider truncate ${isActive ? 'text-white/70' : 'text-muted-foreground'}`}>{channel.group}</p>
                    )}
                  </div>
                  {isActive && <Volume2 className="w-4 h-4 animate-pulse text-white shrink-0" />}
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <p>No channels found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
