'use client';

import { useEffect } from 'react';

/**
 * Disables right-click context menu and common DevTools keyboard shortcuts
 * to deter casual source/design inspection.
 *
 * Note: This is a deterrent only — determined users can still access DevTools
 * via the browser's address bar or OS-level shortcuts.
 */
export function DisableDevTools() {
  useEffect(() => {
    // Block right-click context menu
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    // Block common DevTools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();

      // F12
      if (e.key === 'F12') { e.preventDefault(); return; }

      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C / Ctrl+U (view source)
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(key)) {
        e.preventDefault();
        return;
      }

      // Ctrl+U (view source)
      if (e.ctrlKey && key === 'U') { e.preventDefault(); return; }

      // Ctrl+S (save page)
      if (e.ctrlKey && key === 'S') { e.preventDefault(); return; }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
