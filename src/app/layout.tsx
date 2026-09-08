import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SmoothScroll } from '@/components/SmoothScroll';

export const metadata: Metadata = {
  title: 'GPI Eluzai Kids',
  description:
    'Tempat anak-anak bertumbuh dalam iman, sukacita, dan kasih Kristus.',
};

const themeScript = `
(function () {
  try {
    var key = window.location.pathname.indexOf('/admin') === 0 ? 'admin-theme' : 'theme';
    var stored = window.localStorage.getItem(key);
    document.documentElement.classList.toggle('dark', stored === 'dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
        <SmoothScroll />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
