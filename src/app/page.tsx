import { repository } from '@/lib/data/repository';
import { initialPortfolioItems } from '@/lib/data/mock-data';
import { PublicMediaKitView } from '@/components/public/PublicMediaKitView';
import { ToastProvider } from '@/components/ui/Toast';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [settings, platforms, packages, reactions] = await Promise.all([
    repository.getSiteSettings(),
    repository.getSocialPlatforms(),
    repository.getEndorsePackages(),
    repository.getReactions(),
  ]);

  const portfolioItems = initialPortfolioItems;

  return (
    <ToastProvider>
      <PublicMediaKitView
        initialSettings={settings}
        initialPlatforms={platforms}
        initialPackages={packages}
        initialReactions={reactions}
        portfolioItems={portfolioItems}
      />
    </ToastProvider>
  );
}
