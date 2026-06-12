'use client';

import Link from 'next/link';
import { usePreferences } from '@/store/usePreferences';
import { commonTimezones } from '@/lib/timezone';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Trophy, Clock, Menu, X } from 'lucide-react';
import { Input } from '../ui/input';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function Header() {
  const { timezone, setTimezone } = usePreferences();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
    
    // Clock updater
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/fixtures?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/fixtures');
    }
  };

  const timeFormatter = mounted ? new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }) : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-8 mx-auto">
        {/* Mobile Menu Toggle & Logo */}
        <div className="flex items-center md:hidden mr-2">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
            <Trophy className="h-6 w-6 text-primary" />
          </Link>
        </div>

        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              FIFA 26 Hub
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/fixtures" className="transition-colors hover:text-foreground/80 text-foreground/60">Fixtures</Link>
            <Link href="/live" className="transition-colors hover:text-foreground/80 text-foreground/60">Live</Link>
            <Link href="/standings" className="transition-colors hover:text-foreground/80 text-foreground/60">Standings</Link>
            <Link href="/teams" className="transition-colors hover:text-foreground/80 text-foreground/60">Teams</Link>
            <Link href="/bracket" className="transition-colors hover:text-foreground/80 text-primary font-semibold">Bracket</Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          
          {/* Expandable Search */}
          {isSearchExpanded ? (
            <form onSubmit={handleSearch} className="relative animate-in slide-in-from-right-4 fade-in duration-200">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search matches..."
                value={search}
                autoFocus
                onBlur={() => { if(!search) setIsSearchExpanded(false) }}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-[200px] md:w-[250px] transition-all"
              />
            </form>
          ) : (
            <button 
              onClick={() => setIsSearchExpanded(true)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center space-x-2">
            {/* Clock */}
            {mounted && timeFormatter ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-md border border-border text-sm font-medium tabular-nums text-foreground/80 shadow-sm">
                <Clock className="w-4 h-4 text-primary" />
                {timeFormatter.format(currentTime)}
              </div>
            ) : (
              <div className="hidden sm:block w-[100px] h-9 bg-muted rounded-md animate-pulse" />
            )}

            {/* Timezone Selector */}
            {mounted ? (
              <Select value={timezone} onValueChange={(val) => val && setTimezone(val)}>
                <SelectTrigger className="w-[140px] md:w-[180px] h-9">
                  <SelectValue placeholder="Timezone" />
                </SelectTrigger>
                <SelectContent>
                  {commonTimezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="w-[140px] md:w-[180px] h-9 bg-muted rounded-md animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 border-b bg-background/95 backdrop-blur shadow-md animate-in slide-in-from-top-2 fade-in duration-200">
          <nav className="flex flex-col p-4 space-y-4">
            <Link href="/fixtures" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium transition-colors hover:text-primary">Fixtures</Link>
            <Link href="/live" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium transition-colors hover:text-primary">Live</Link>
            <Link href="/standings" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium transition-colors hover:text-primary">Standings</Link>
            <Link href="/teams" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium transition-colors hover:text-primary">Teams</Link>
            <Link href="/bracket" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium transition-colors hover:text-primary">Bracket</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
