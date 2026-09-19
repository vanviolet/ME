import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import { FlowchartStudio } from './flowchart/FlowchartStudio';

export const FlowchartPage: React.FC = () => {
  const { language } = usePortfolio();

  return (
    <>
      <Seo
        title={
          language === 'en'
            ? 'Interactive Flowchart Studio & Mermaid Architect — Muchamad Irvan'
            : 'Studio Flowchart Interaktif & Arsitek Mermaid — Muchamad Irvan'
        }
        description={
          language === 'en'
            ? 'Overpowered interactive drag & drop flowchart builder with 2-way Mermaid code sync, AI system architecture generator, auto-layout, step-by-step logic simulation, and high-resolution export.'
            : 'Perkakas pembuat flowchart interaktif drag & drop dengan sinkronisasi kode Mermaid 2 arah, generator arsitektur AI, tata letak otomatis, simulasi logika interaktif, dan ekspor resolusi tinggi.'
        }
        url="/tools/flowchart"
      />
      <FlowchartStudio />
    </>
  );
};
