import Link from 'next/link';
import { Trophy } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t py-12 bg-muted/20">
      <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="font-bold">FIFA 26 Hub</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            The ultimate open-source FIFA World Cup 2026 Fixtures & Results platform.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/fixtures" className="hover:text-primary">All Fixtures</Link></li>
            <li><Link href="/live" className="hover:text-primary">Live Matches</Link></li>
            <li><Link href="/standings" className="hover:text-primary">Group Standings</Link></li>
            <li><Link href="/teams" className="hover:text-primary">Teams</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Community</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/predictions" className="hover:text-primary">Match Predictor</Link></li>
            <li><Link href="/favorites" className="hover:text-primary">My Favorites</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><span className="hover:text-primary cursor-pointer">Privacy Policy</span></li>
            <li><span className="hover:text-primary cursor-pointer">Terms of Service</span></li>
            <li className="pt-4 text-xs">
              Note: This is an unofficial platform. FIFA, World Cup, and all associated logos are trademarks of FIFA.
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-8 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} World Cup 2026 Hub. All rights reserved.</p>
        <p className="mt-2">
          Vibe Coded By{' '}
          <a
            href="https://github.com/Coder-Sadik"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-primary transition-colors"
          >
            Sadik Rahman
          </a>
        </p>
      </div>
    </footer>
  );
}
