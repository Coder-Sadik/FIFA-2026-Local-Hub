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
import { Search, Info, Radio, Trophy } from 'lucide-react';
import { Input } from '../ui/input';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function Header() {
  const { timezone, setTimezone } = usePreferences();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/fixtures?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/fixtures');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-8 mx-auto">
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
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search matches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </form>
          </div>
          <div className="flex items-center space-x-2">
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
    </header>
  );
}
