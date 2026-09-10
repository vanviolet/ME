/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Experience } from './components/Experience';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { Philosophy } from './components/Philosophy';
import { Blog } from './components/Blog';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <PortfolioProvider>
      <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 selection:bg-rose-500/20 selection:text-rose-600 dark:selection:bg-rose-500/30 dark:selection:text-rose-400 font-sans">
        <Navbar />
        <main>
          <Hero />
          <About />
          <Experience />
          <Projects />
          <Skills />
          <Philosophy />
          <Blog />
          <Contact />
        </main>
        <Footer />
      </div>
    </PortfolioProvider>
  );
}

