import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TCF Canada Pro - Griffon D\'OR',
    short_name: 'TCF Pro',
    description: 'Préparez et réussissez le TCF Canada avec l\'IA officielle Griffon D\'OR. Simulations, corrections intelligentes et suivi hors connexion.',
    start_url: '/dashboard',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    background_color: '#0f172a', // Slate 900 pour une transition sombre élégante
    theme_color: '#D52B1E', // Rouge officiel Canada
    orientation: 'any',
    prefer_related_applications: false,
    categories: ['education', 'productivity', 'reference'],
    icons: [
      {
        src: '/icon?size=192x192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon?size=512x512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    shortcuts: [
      {
        name: 'Examen Compréhension Orale',
        short_name: 'CO Examen',
        description: 'Lancer une simulation officielle de Compréhension Orale',
        url: '/dashboard/exams/listening',
        icons: [{ src: '/icon?size=192x192', sizes: '192x192' }]
      },
      {
        name: 'Examen Expression Écrite',
        short_name: 'EE Examen',
        description: 'Rédiger une tâche avec correction IA',
        url: '/dashboard/exams/writing',
        icons: [{ src: '/icon?size=192x192', sizes: '192x192' }]
      }
    ]
  } as MetadataRoute.Manifest;
}
