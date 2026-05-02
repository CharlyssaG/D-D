import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'D&D Campaign Manager',
  description: 'Beginner-friendly digital D&D campaign tool with storybook aesthetic',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
