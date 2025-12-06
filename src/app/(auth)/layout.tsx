'use client';
import { CompanyProvider } from '@/hooks/use-company';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CompanyProvider>
      <div className="flex min-h-screen w-full flex-col">{children}</div>
    </CompanyProvider>
  );
}