import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Discipline-OS — Sistem Konsistensi Personal',
    short_name: 'Discipline-OS',
    description: 'Sistem konsistensi harian yang tenang, terstruktur, dan bebas rasa bersalah.',
    start_url: '/today',
    display: 'standalone',
    background_color: '#f8faf9',
    theme_color: '#107e59',
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
