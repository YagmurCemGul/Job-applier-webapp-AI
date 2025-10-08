/**
 * @fileoverview Portfolio page - hub for site building and publishing.
 * @module pages/Portfolio
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SiteDashboard } from '@/components/site/SiteDashboard';
import { ProfileEditor } from '@/components/site/ProfileEditor';
import { CaseStudyEditor } from '@/components/site/CaseStudyEditor';
import { BlogEditor } from '@/components/site/BlogEditor';
import { MediaLibrary } from '@/components/site/MediaLibrary';
import { SEOInspector } from '@/components/site/SEOInspector';
import { ThemePicker } from '@/components/site/ThemePicker';
import { PreviewPane } from '@/components/site/PreviewPane';
import { PublishDialog } from '@/components/site/PublishDialog';
import { ContactFormBuilder } from '@/components/site/ContactFormBuilder';
import { SocialScheduler } from '@/components/site/SocialScheduler';
import { AnalyticsPanel } from '@/components/site/AnalyticsPanel';
import { DomainSetup } from '@/components/site/DomainSetup';
import {
  Globe,
  FileText,
  BookOpen,
  Image,
  Settings,
  Eye,
  Upload,
  Mail,
  Share2,
  BarChart3,
  Link as LinkIcon,
} from 'lucide-react';

/**
 * Portfolio - main page for portfolio site builder.
 */
export default function Portfolio() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  const tabs = [
    { id: 'dashboard', label: t('site.dashboard'), icon: Globe },
    { id: 'profile', label: t('site.profile'), icon: Settings },
    { id: 'cases', label: t('site.caseStudies'), icon: FileText },
    { id: 'blog', label: t('site.blog'), icon: BookOpen },
    { id: 'media', label: t('site.media'), icon: Image },
    { id: 'seo', label: t('site.seo'), icon: LinkIcon },
    { id: 'theme', label: t('site.theme'), icon: Settings },
    { id: 'social', label: t('site.social'), icon: Share2 },
    { id: 'analytics', label: t('site.analytics'), icon: BarChart3 },
    { id: 'contact', label: t('site.contact'), icon: Mail },
    { id: 'preview', label: t('site.preview'), icon: Eye },
    { id: 'publish', label: t('site.publish'), icon: Upload },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Portfolio Publisher</h1>
        <p className="text-muted-foreground">
          Build your personal brand with case studies, blog, and polished site
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start flex-wrap h-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <SiteDashboard onNavigate={handleNavigate} />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <ProfileEditor />
        </TabsContent>

        <TabsContent value="cases" className="mt-6">
          <CaseStudyEditor />
        </TabsContent>

        <TabsContent value="blog" className="mt-6">
          <BlogEditor />
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <MediaLibrary />
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <SEOInspector />
        </TabsContent>

        <TabsContent value="theme" className="mt-6">
          <ThemePicker />
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <SocialScheduler />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsPanel />
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <ContactFormBuilder />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <PreviewPane />
        </TabsContent>

        <TabsContent value="publish" className="mt-6">
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">Ready to publish?</h3>
            <p className="text-muted-foreground mb-6">
              Export your site or deploy to a hosting provider
            </p>
            <button
              onClick={() => setPublishDialogOpen(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <Upload className="h-5 w-5 inline mr-2" />
              {t('site.publish')}
            </button>
          </div>
        </TabsContent>
      </Tabs>

      <PublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
      />
    </div>
  );
}