import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { Bell, CalendarClock, FlaskConical, History, Home, MapPin, Menu, PenLine, ShieldCheck, Stethoscope, Syringe, UserRound } from 'lucide-react';
import Wordmark from './Wordmark';
import SiteFooter from './SiteFooter';
import { useMeta } from '../lib/useMeta';
import { api } from '../lib/api';

const NAV = [
  { to: '/home', label: 'Overview', icon: Home, tab: true },
  { to: '/recommendations', label: 'Recommendations', short: 'Vaccines', icon: Syringe, tab: true },
  { to: '/safety', label: 'Safety', icon: ShieldCheck, tab: true },
  { to: '/review', label: 'Clinical review', icon: Stethoscope },
  { to: '/providers', label: 'Find providers', short: 'Providers', icon: MapPin, tab: true },
  { to: '/schedule', label: 'Schedule', icon: CalendarClock },
  { to: '/notifications', label: 'Vaccine update alerts', icon: Bell },
  { to: '/history', label: 'History', icon: History, tab: true },
];

// Side rail (desktop): the app's five places, one action, the account.
function railLink({ isActive }) {
  return `flex min-h-11 items-center gap-3 rounded-sm px-3 text-sm no-underline transition-colors duration-150 ${
    isActive
      ? 'bg-deep-3 font-semibold text-on-deep'
      : 'text-on-deep-muted hover:bg-deep-2 hover:text-on-deep'
  }`;
}

function tabLink({ isActive }) {
  return `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs no-underline ${
    isActive ? 'text-accent font-semibold' : 'text-ink-2'
  }`;
}

function DemoMarker({ className = '' }) {
  return (
    <p className={`flex items-start gap-2 text-xs ${className}`}>
      <FlaskConical className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
      <span>Demo mode. Provider, availability and price information is simulated.</span>
    </p>
  );
}

/**
 * Phones show five tabs; everything else lives in this menu so every page is
 * reachable. Native <details>: keyboard and screen-reader friendly, no JS state.
 */
function MobileMenu() {
  const close = (e) => e.currentTarget.closest('details')?.removeAttribute('open');
  const links = [...NAV, { to: '/record', label: 'Record a vaccination', icon: PenLine }, { to: '/profile', label: 'Profile', icon: UserRound }];
  return (
    <details className="relative">
      <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-end gap-2 text-sm text-on-deep-muted hover:text-on-deep [&::-webkit-details-marker]:hidden">
        <Menu className="h-5 w-5" aria-hidden="true" />
        <span>Menu</span>
      </summary>
      <nav aria-label="All pages" className="absolute right-0 top-full z-50 mt-1 w-64 rounded-md bg-paper p-2 text-ink shadow-overlay">
        <ul>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={close}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center gap-3 rounded-sm px-3 text-sm no-underline ${
                      isActive ? 'bg-accent-soft font-semibold text-ink' : 'text-ink-2 hover:bg-paper-2'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </details>
  );
}

export default function AppLayout() {
  const meta = useMeta();
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    let active = true;
    const checkAlerts = async () => {
      try {
        const result = await api.post('/notifications/sync');
        if (active) setUnreadAlerts(result.unreadCount ?? 0);
      } catch {
        // Keep the account shell usable if notification delivery is offline.
      }
    };
    checkAlerts();
    const interval = window.setInterval(checkAlerts, 5 * 60 * 1000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <div className="flex min-h-screen flex-1">
        {/* The outer column carries the paper step full-height; the inner rail sticks. */}
        <div className="hidden w-60 shrink-0 bg-deep lg:block">
          <aside className="sticky top-0 flex h-screen flex-col px-4 py-5">
            <div className="px-1">
              <Wordmark to="/home" onDeep />
            </div>
            <nav aria-label="Main" className="mt-8">
              <ul className="space-y-0.5">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink to={item.to} className={railLink}>
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="flex-1 whitespace-nowrap">{item.label}</span>
                        {item.to === '/notifications' && unreadAlerts > 0 && <span className="rounded-full bg-accent-bright px-2 py-0.5 text-xs font-bold text-deep" aria-label={`${unreadAlerts} unread`}>{unreadAlerts}</span>}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="mt-6 border-t border-on-deep/15 pt-4">
              <NavLink to="/record" className={railLink}>
                <PenLine className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">Record a vaccination</span>
              </NavLink>
            </div>
            <div className="mt-auto space-y-4">
              {meta?.demoMode && (
                <DemoMarker className="rounded-sm border border-dashed border-on-deep/35 p-3 text-on-deep-muted" />
              )}
              <NavLink to="/profile" className={railLink}>
                <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Profile</span>
              </NavLink>
            </div>
          </aside>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="bg-deep text-on-deep lg:hidden">
            <div className="flex items-center justify-between gap-4 px-4 sm:px-6">
              <Wordmark to="/home" onDeep />
              <MobileMenu />
            </div>
            {meta?.demoMode && (
              <DemoMarker className="border-t border-dashed border-on-deep/25 bg-deep-2 px-4 py-1.5 text-on-deep-muted sm:px-6" />
            )}
          </header>

          <main id="main" className="flex-1">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
              <Outlet />
            </div>
          </main>

          <SiteFooter />
          {/* Keeps the footer clear of the fixed tab bar. */}
          <div className="h-14 lg:hidden" aria-hidden="true" />
        </div>
      </div>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-paper lg:hidden">
        <ul className="flex">
          {NAV.filter((item) => item.tab).map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to} className="flex flex-1">
                <NavLink to={item.to} className={tabLink}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="whitespace-nowrap">{item.short ?? item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
