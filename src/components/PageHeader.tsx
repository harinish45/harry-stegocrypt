import { ReactNode } from 'react';

export default function PageHeader({ icon: Icon, title, description, actions }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8 pb-6 border-b border-border/50">
      <div className="flex items-start gap-4">
        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 grid place-items-center shrink-0 shadow-sm border border-primary/20">
          <Icon className="w-5 h-5 text-primary" />
          <div className="absolute inset-0 rounded-xl bg-primary/10 blur-md -z-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{description}</p>
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
