import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import { PhotoEditor } from './photo-editor/PhotoEditor';

export const ImageCropperPage: React.FC = () => {
  const { language } = usePortfolio();

  return (
    <>
      <Seo
        title={
          language === 'en'
            ? 'Professional Photo Editor & Studio — Muchamad Irvan'
            : 'Editor Foto & Desain Studio Profesional — Muchamad Irvan'
        }
        description={
          language === 'en'
            ? 'Full-featured online photo editor & design studio with typography formatting, layer stacking, custom filters, background removal, vector shapes, stickers, and 4K export.'
            : 'Editor foto & studio desain grafis lengkap dengan pengaturan tipografi presisi, layer, filter warna, hapus background otomatis, bentuk vektor, stiker, dan ekspor resolusi tinggi.'
        }
        url="/tools/image-cropper"
      />
      <PhotoEditor />
    </>
  );
};
