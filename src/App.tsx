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
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import React from 'react';

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

export default function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <Router>
          <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 selection:bg-rose-500/20 selection:text-rose-600 dark:selection:bg-rose-500/30 dark:selection:text-rose-400 font-sans">
            <Navbar />
            <ScrollHandler />
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
              <Route path="/issues" element={<IssuesPage />} />
              <Route path="/issues/:id" element={<IssuesPage />} />
              <Route path="/issue" element={<IssuesPage />} />
              <Route path="/issue/:id" element={<IssuesPage />} />
              <Route path="/admin" element={<AdminVerificationPage />} />
              {/* Fallback */}
              <Route path="*" element={<HomePage />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </PortfolioProvider>
    </AuthProvider>
  );
}

