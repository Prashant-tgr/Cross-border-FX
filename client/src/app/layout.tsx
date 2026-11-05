import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cross-Border FX Spread & Remittance Router',
  description:
    'Tracks real-time spreads across SWIFT, local rails, and fintech partners, dynamically routing international commercial supplier transfers for optimal rates.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
