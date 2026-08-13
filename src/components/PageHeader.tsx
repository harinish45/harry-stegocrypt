import { ReactNode } from 'react';

export default function PageHeader({ icon: Icon, title, description, actions }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 md:mb-8 pb-5 md:pb-6 border-b border-border/50">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 grid place-items-center shrink-0 shadow-sm border border-primary/20">
          <Icon className="w-5 h-5 text-primary" />
          <div className="absolute inset-0 rounded-xl bg-primary/10 blur-md -z-10" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text break-words">
            {title}
          </h1>
          <p className="text-[15px] md:text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">{description}</p>
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}

    </div>
  );
}
