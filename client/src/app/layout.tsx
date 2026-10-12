import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bait-ul-Maal | Household Financial & Rental Management System',
  description: 'Comprehensive Household Financial & Rental Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
