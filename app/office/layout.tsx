import { requireUser } from '@/lib/auth';

export default async function OfficeLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return children;
}
