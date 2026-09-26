import { Outlet } from 'react-router';
import Wordmark from './Wordmark';
import SiteFooter from './SiteFooter';

export default function PublicLayout() {
  return (
    <>
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-2 sm:px-6">
          <Wordmark to="/" />
        </div>
      </header>
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
