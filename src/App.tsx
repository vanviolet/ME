/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PortfolioProvider } from './context/PortfolioContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Experience } from './components/Experience';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { Philosophy } from './components/Philosophy';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ArticlesPage } from './components/ArticlesPage';
import { ArticlePage } from './components/ArticlePage';
import { CreateArticlePage } from './components/CreateArticlePage';
import { EditArticlePage } from './components/EditArticlePage';
import { VanpediaPage, VanpediaIndexPage } from './components/VanpediaPage';
import { CreateVanpediaPage } from './components/CreateVanpediaPage';
import { IssuesPage } from './components/IssuesPage';
import { AdminVerificationPage } from './components/AdminVerificationPage';
import { ToolsIndexPage } from './components/ToolsIndexPage';
import { LoremIpsumPage } from './components/LoremIpsumPage';
import { JsonFormatterPage } from './components/tools/JsonFormatterPage';
import { Base64Page } from './components/tools/Base64Page';
import { CssGradientPage } from './components/tools/CssGradientPage';
import { ImageCropperPage } from './components/tools/ImageCropperPage';
import { JwtDebuggerPage } from './components/tools/JwtDebuggerPage';
import { RegexTesterPage } from './components/tools/RegexTesterPage';
import { UuidGeneratorPage } from './components/tools/UuidGeneratorPage';
import { SqlFormatterPage } from './components/tools/SqlFormatterPage';
import { JsonToTypesPage } from './components/tools/JsonToTypesPage';
import { CronGeneratorPage } from './components/tools/CronGeneratorPage';
import { TimestampConverterPage } from './components/tools/TimestampConverterPage';
import { CurlToCodePage } from './components/tools/CurlToCodePage';
import { DiffCheckerPage } from './components/tools/DiffCheckerPage';
import { ColorContrastPage } from './components/tools/ColorContrastPage';
import { SvgToJsxPage } from './components/tools/SvgToJsxPage';
import { YamlJsonConverterPage } from './components/tools/YamlJsonConverterPage';
import { MockDataGeneratorPage } from './components/tools/MockDataGeneratorPage';
import { ChmodCalculatorPage } from './components/tools/ChmodCalculatorPage';
import { MetaTagGeneratorPage } from './components/tools/MetaTagGeneratorPage';
import { QrCodeGeneratorPage } from './components/tools/QrCodeGeneratorPage';
import { UrlEncoderDecoderPage } from './components/tools/UrlEncoderDecoderPage';
import { AiIllustrationPage } from './components/tools/AiIllustrationPage';
import { JiraProvider } from './components/jira/JiraContext';
import { AiChatFloating } from './components/AiChatFloating';
import { TextSelectionPopover } from './components/TextSelectionPopover';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import React from 'react';

const VideoEditor = lazy(() => import('./components/tools/video-editor/VideoEditor').then(m => ({ default: m.VideoEditor })));
const FlowchartPage = lazy(() => import('./components/tools/FlowchartPage').then(m => ({ default: m.FlowchartPage })));
const ApiTesterPage = lazy(() => import('./components/tools/ApiTesterPage').then(m => ({ default: m.ApiTesterPage })));
const EslintRulesGeneratorPage = lazy(() => import('./components/tools/EslintRulesGeneratorPage').then(m => ({ default: m.EslintRulesGeneratorPage })));
const NotesNotebookPage = lazy(() => import('./components/tools/NotesNotebookPage').then(m => ({ default: m.NotesNotebookPage })));
const CvPage = lazy(() => import('./components/CvPage').then(m => ({ default: m.CvPage })));
const JiraApp = lazy(() => import('./components/jira/JiraApp').then(m => ({ default: m.JiraApp })));

/**
 * Home page — renders all portfolio sections as a single scroll-based page.
 */
const HomePage: React.FC = () => (
  <main>
    <Hero />
    <About />
    <Experience />
    <Skills />
    <Projects />
    <Philosophy />
    <Contact />
  </main>
);

/**
 * Scroll to hash section on route change or hash change.
 */
const ScrollHandler: React.FC = () => {
  const location = useLocation();
  useEffect(() => {
    // If there's a hash, scroll to it; otherwise scroll to top
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);
  return null;
};

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isJira = location.pathname.startsWith('/tools/jira') || location.pathname.startsWith('/jira');
  const isPhotoEditor =
    location.pathname.startsWith('/tools/image-cropper') ||
    location.pathname.startsWith('/tools/crop-image') ||
    location.pathname.startsWith('/tools/photo-editor') ||
    location.pathname.startsWith('/photo-editor');
  const isVideoEditor =
    location.pathname.startsWith('/tools/video-editor') ||
    location.pathname.startsWith('/video-editor');
  const isFlowchart =
    location.pathname.startsWith('/tools/flowchart') ||
    location.pathname.startsWith('/flowchart');
  const isApiTester =
    location.pathname.startsWith('/tools/api-tester') ||
    location.pathname.startsWith('/api-tester') ||
    location.pathname.startsWith('/tools/postman') ||
    location.pathname.startsWith('/postman');
  const isNotes =
    location.pathname.startsWith('/tools/notes') ||
    location.pathname.startsWith('/notes') ||
    location.pathname.startsWith('/notebook');

  const isFullScreenStudio = isJira || isPhotoEditor || isVideoEditor || isFlowchart || isApiTester || isNotes;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 selection:bg-rose-500/20 selection:text-rose-600 dark:selection:bg-rose-500/30 dark:selection:text-rose-400 font-sans">
      {!isFullScreenStudio && <Navbar />}
      <ScrollHandler />
      <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-sm font-medium text-stone-400 dark:text-zinc-500">Memuat modul...</div>}>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/article" element={<ArticlesPage />} />
        <Route path="/articles/create" element={<CreateArticlePage />} />
        <Route path="/articles/edit/:slug" element={<EditArticlePage />} />
        <Route path="/articles/:slug/edit" element={<EditArticlePage />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
        <Route path="/article/:slug" element={<ArticlePage />} />
        <Route path="/vanpedia" element={<VanpediaIndexPage />} />
        <Route path="/vanpedia/create" element={<CreateVanpediaPage />} />
        <Route path="/vanpedia/:slug" element={<VanpediaPage />} />
        <Route path="/forum" element={<IssuesPage />} />
        <Route path="/forum/:id" element={<IssuesPage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/issues/:id" element={<IssuesPage />} />
        <Route path="/issue" element={<IssuesPage />} />
        <Route path="/issue/:id" element={<IssuesPage />} />
        <Route path="/admin" element={<AdminVerificationPage />} />
        <Route path="/tools" element={<ToolsIndexPage />} />
        <Route path="/tools/flowchart" element={<FlowchartPage />} />
        <Route path="/flowchart" element={<FlowchartPage />} />
        <Route path="/tools/api-tester" element={<ApiTesterPage />} />
        <Route path="/api-tester" element={<ApiTesterPage />} />
        <Route path="/tools/postman" element={<ApiTesterPage />} />
        <Route path="/postman" element={<ApiTesterPage />} />
        <Route path="/tools/jira" element={<JiraApp />} />
        <Route path="/tools/jira/*" element={<JiraApp />} />
        <Route path="/jira" element={<JiraApp />} />
        <Route path="/jira/*" element={<JiraApp />} />
        <Route path="/tools/eslint-rules" element={<EslintRulesGeneratorPage />} />
        <Route path="/tools/eslint" element={<EslintRulesGeneratorPage />} />
        <Route path="/eslint-rules" element={<EslintRulesGeneratorPage />} />
        <Route path="/eslint" element={<EslintRulesGeneratorPage />} />
        <Route path="/tools/notes" element={<NotesNotebookPage />} />
        <Route path="/tools/notebook" element={<NotesNotebookPage />} />
        <Route path="/tools/trilium" element={<NotesNotebookPage />} />
        <Route path="/notes" element={<NotesNotebookPage />} />
        <Route path="/notebook" element={<NotesNotebookPage />} />
        <Route path="/tools/lorem-ipsum" element={<LoremIpsumPage />} />
        <Route path="/tools/json-formatter" element={<JsonFormatterPage />} />
        <Route path="/tools/base64" element={<Base64Page />} />
        <Route path="/tools/css-gradient" element={<CssGradientPage />} />
        <Route path="/tools/jwt-debugger" element={<JwtDebuggerPage />} />
        <Route path="/tools/jwt" element={<JwtDebuggerPage />} />
        <Route path="/tools/regex-tester" element={<RegexTesterPage />} />
        <Route path="/tools/regex" element={<RegexTesterPage />} />
        <Route path="/tools/uuid-generator" element={<UuidGeneratorPage />} />
        <Route path="/tools/uuid" element={<UuidGeneratorPage />} />
        <Route path="/tools/sql-formatter" element={<SqlFormatterPage />} />
        <Route path="/tools/sql" element={<SqlFormatterPage />} />
        <Route path="/tools/json-to-types" element={<JsonToTypesPage />} />
        <Route path="/tools/types" element={<JsonToTypesPage />} />
        <Route path="/tools/cron-generator" element={<CronGeneratorPage />} />
        <Route path="/tools/cron" element={<CronGeneratorPage />} />
        <Route path="/tools/timestamp-converter" element={<TimestampConverterPage />} />
        <Route path="/tools/timestamp" element={<TimestampConverterPage />} />
        <Route path="/tools/curl-to-code" element={<CurlToCodePage />} />
        <Route path="/tools/curl" element={<CurlToCodePage />} />
        <Route path="/tools/diff-checker" element={<DiffCheckerPage />} />
        <Route path="/tools/diff" element={<DiffCheckerPage />} />
        <Route path="/tools/color-contrast" element={<ColorContrastPage />} />
        <Route path="/tools/contrast" element={<ColorContrastPage />} />
        <Route path="/tools/svg-to-jsx" element={<SvgToJsxPage />} />
        <Route path="/tools/svg" element={<SvgToJsxPage />} />
        <Route path="/tools/yaml-json-converter" element={<YamlJsonConverterPage />} />
        <Route path="/tools/yaml" element={<YamlJsonConverterPage />} />
        <Route path="/tools/mock-data-generator" element={<MockDataGeneratorPage />} />
        <Route path="/tools/mock-data" element={<MockDataGeneratorPage />} />
        <Route path="/tools/chmod-calculator" element={<ChmodCalculatorPage />} />
        <Route path="/tools/chmod" element={<ChmodCalculatorPage />} />
        <Route path="/tools/meta-tag-generator" element={<MetaTagGeneratorPage />} />
        <Route path="/tools/meta-tags" element={<MetaTagGeneratorPage />} />
        <Route path="/tools/qr-generator" element={<QrCodeGeneratorPage />} />
        <Route path="/tools/qrcode" element={<QrCodeGeneratorPage />} />
        <Route path="/tools/qr" element={<QrCodeGeneratorPage />} />
        <Route path="/tools/url-encoder-decoder" element={<UrlEncoderDecoderPage />} />
        <Route path="/tools/url-encoder" element={<UrlEncoderDecoderPage />} />
        <Route path="/tools/url-decoder" element={<UrlEncoderDecoderPage />} />
        <Route path="/tools/url" element={<UrlEncoderDecoderPage />} />
        <Route path="/tools/ai-illustration" element={<AiIllustrationPage />} />
        <Route path="/tools/illustration" element={<AiIllustrationPage />} />
        <Route path="/tools/ai-image" element={<AiIllustrationPage />} />
        <Route path="/tools/image-generator" element={<AiIllustrationPage />} />
        <Route path="/tools/image-cropper" element={<ImageCropperPage />} />
        <Route path="/tools/crop-image" element={<ImageCropperPage />} />
        <Route path="/tools/photo-editor" element={<ImageCropperPage />} />
        <Route path="/photo-editor" element={<ImageCropperPage />} />
        <Route path="/tools/video-editor" element={<VideoEditor />} />
        <Route path="/video-editor" element={<VideoEditor />} />
        <Route path="/cv" element={<CvPage />} />
        <Route path="/resume" element={<CvPage />} />
        {/* Fallback */}
        <Route path="*" element={<HomePage />} />
      </Routes>
      </Suspense>
      {!isFullScreenStudio && (
        <div className="print:hidden">
          <Footer />
          <AiChatFloating />
          <TextSelectionPopover />
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <Router>
          <JiraProvider>
            <AppLayout />
          </JiraProvider>
        </Router>
      </PortfolioProvider>
    </AuthProvider>
  );
}

