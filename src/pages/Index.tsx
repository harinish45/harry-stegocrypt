import { useTranslation } from 'react-i18next';
import { Image as ImageIcon } from 'lucide-react';
import StegoCryptTabs from '@/components/StegoCryptTabs';
import PageHeader from '@/components/PageHeader';

const Index = () => {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader
        icon={ImageIcon}
        title={t('app.title')}
        description={t('app.subtitle')}
      />
      <StegoCryptTabs />
    </div>
  );
};

export default Index;
