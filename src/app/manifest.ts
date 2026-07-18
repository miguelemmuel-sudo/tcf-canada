import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TCF Canada Pro',
    short_name: 'TCF Pro',
    description: 'Préparez le TCF Canada avec intelligence. Examens blancs, IA correctrice et suivi personnalisé.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#D52B1E',
    icons: [
      {
        src: '/icon?size=192x192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon?size=512x512',
        sizes: '512x512',
        type: 'image/png',
      }
    ],
  };
}
