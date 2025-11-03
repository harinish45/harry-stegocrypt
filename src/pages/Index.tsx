import { useTranslation } from 'react-i18next';
import StegoCryptTabs from "@/components/StegoCryptTabs";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Index = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <div className="flex justify-end gap-2 mb-6">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">
            {t('app.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('app.subtitle')}
          </p>
        </header>
        
        <main>
          <StegoCryptTabs />
        </main>
        
        <footer className="mt-20 text-center text-sm text-muted-foreground">
          <p>{t('app.footer')}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
