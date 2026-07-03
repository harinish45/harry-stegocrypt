import { SecurityAnalysis } from '@/components/SecurityAnalysis';
import PageHeader from '@/components/PageHeader';
import { ShieldCheck } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div>
      <PageHeader icon={ShieldCheck} title="Security Guide" description="Reference material on the algorithms and threat models used in this app." />
      <SecurityAnalysis />
    </div>
  );
}
