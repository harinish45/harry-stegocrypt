import { ReactNode } from 'react';

export default function PageHeader({ icon: Icon, title, description, actions }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 grid place-items-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      {actions}
    </div>
  );
}
