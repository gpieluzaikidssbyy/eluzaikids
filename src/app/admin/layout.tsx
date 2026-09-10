'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { fetchCsrfToken } from '@/lib/csrf-client';
import { getInitials } from '@/lib/helpers';
import { AppSidebar } from '@/components/admin/app-sidebar';
import { AppHeader } from '@/components/admin/app-header';
import { STANDALONE_ROUTES } from '@/components/admin/nav';
import { Toaster } from '@/components/ui/sonner';

/* ─── Layout ─── */

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionUsername, setSessionUsername] = useState('');

  /* Auth */
  useEffect(() => {
    if (STANDALONE_ROUTES.includes(pathname)) {
      setAuthLoading(false);
      return;
    }
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) router.replace('/admin/login');
        else {
          setSessionUsername(data.user?.username || data.user?.name || 'Admin');
          setAuthLoading(false);
        }
      });
  }, [pathname, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  /* Early returns for standalone routes */
  if (STANDALONE_ROUTES.includes(pathname)) {
    return (
      <>
        <Toaster />
        {children}
      </>
    );
  }

  if (authLoading) {
    return (
      <div className="font-admin-scope flex min-h-screen flex-col items-center justify-center gap-5 bg-background text-muted-foreground">
        <div className="relative">
          <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/20" />
          <img src="/images/logo.webp" alt="GPI Eluzai Kids" className="h-16 w-16 rounded-xl object-contain" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Memeriksa sesi...
        </div>
      </div>
    );
  }

  const initials = getInitials(sessionUsername);

  const handleLogout = async () => {
    const token = await fetchCsrfToken();
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { ...(token ? { 'x-csrf-token': token } : {}) },
    });
    router.replace('/admin/login');
  };

  return (
    <div className="font-admin-scope flex min-h-screen bg-background">
      <Toaster />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-md [backdrop-filter:blur(10px)] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar (hover-expandable on desktop, drawer on mobile) ─── */}
      <AppSidebar
        sessionUsername={sessionUsername}
        initials={initials}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
        onLogout={() => void handleLogout()}
      />

      {/* ─── Main column ─── */}
      <div className="min-w-0 flex-1">
        <AppHeader
          sessionUsername={sessionUsername}
          initials={initials}
          onMobileOpenChange={setMobileOpen}
          onLogout={() => void handleLogout()}
        />

        {/* Content */}
        <div className="relative">
          <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}