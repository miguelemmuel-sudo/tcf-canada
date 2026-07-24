/**
 * Service Worker Avancé PWA pour TCF Canada Pro (Griffon D'OR)
 * Spécialement optimisé pour l'Afrique centrale et les réseaux instables / coupures Internet.
 * Stratégies : App Shell (Cache-First), API/Dynamique (Network-First + Fallback),
 * Ressources pédagogiques (Stale-While-Revalidate).
 */

const CACHE_STATIC = 'tcf-pro-static-v2';
const CACHE_DYNAMIC = 'tcf-pro-dynamic-v2';
const CACHE_AUDIO = 'tcf-pro-audio-v2';

const APP_SHELL = [
  '/',
  '/dashboard',
  '/favicon.ico',
  '/manifest.webmanifest'
];

// --- INSTALLATION : Préchargement de l'App Shell ---
self.addEventListener('install', (event) => {
  console.log('[SW] Installation du Service Worker v2...');
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      console.log('[SW] Mise en cache de l\'App Shell...');
      // On utilise addAll mais en ignorant les échecs mineurs pour ne pas bloquer l'install
      return Promise.allSettled(
        APP_SHELL.map(url => cache.add(url).catch(e => console.warn('[SW] Ignore cache miss sur:', url)))
      );
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// --- ACTIVATION : Nettoyage des anciens caches ---
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation et purge des anciens caches...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_STATIC && key !== CACHE_DYNAMIC && key !== CACHE_AUDIO) {
            console.log('[SW] Suppression de l\'ancien cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// --- FETCH : Routage intelligent selon le type de ressource ---
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 0. Ignorer les requêtes non-GET ou externes non pertinentes (analytics, chrome-extensions, etc.)
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Ignorer les appels d'authentification Supabase pour éviter de cacher les tokens sensibles
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/auth/')) {
    return;
  }

  // 1. STRATÉGIE CACHE-FIRST : Ressources statiques (Images, polices, CSS, JS, icônes)
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|avif|ico|css|js|woff|woff2|ttf)$/i) ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('images.unsplash.com')
  ) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        if (cachedRes) {
          // Mise à jour en arrière-plan (Stale-while-revalidate discret)
          fetch(req).then(networkRes => {
            if (networkRes && networkRes.status === 200) {
              caches.open(CACHE_STATIC).then(cache => cache.put(req, networkRes));
            }
          }).catch(() => {});
          return cachedRes;
        }
        return fetch(req).then((networkRes) => {
          if (!networkRes || networkRes.status !== 200 || networkRes.type !== 'basic' && !url.hostname.includes('unsplash') && !url.hostname.includes('fonts')) {
            return networkRes;
          }
          const resToCache = networkRes.clone();
          caches.open(CACHE_STATIC).then((cache) => cache.put(req, resToCache));
          return networkRes;
        }).catch(() => {
          // Fallback image en cas d'erreur
          if (url.pathname.match(/\.(png|jpg|jpeg|webp)$/i)) {
            return caches.match('/favicon.ico');
          }
          return new Response('', { status: 408, statusText: 'Offline Asset Miss' });
        });
      })
    );
    return;
  }

  // 2. STRATÉGIE CACHE-FIRST / AUDIO : Fichiers audios (.mp3, .wav, /api/audio/)
  if (url.pathname.match(/\.(mp3|wav|ogg)$/i) || url.pathname.includes('/api/audio/')) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        if (cachedRes) return cachedRes;
        return fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resToCache = networkRes.clone();
            caches.open(CACHE_AUDIO).then((cache) => cache.put(req, resToCache));
          }
          return networkRes;
        }).catch(() => {
          return new Response('Audio indisponible hors ligne', { status: 503, statusText: 'Audio Offline' });
        });
      })
    );
    return;
  }

  // 3. STRATÉGIE NETWORK-FIRST AVEC FALLBACK : Navigation (Pages HTML, /dashboard, etc.)
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resToCache = networkRes.clone();
          caches.open(CACHE_DYNAMIC).then((cache) => cache.put(req, resToCache));
        }
        return networkRes;
      }).catch(() => {
        console.log('[SW] Hors ligne - tentative de restauration depuis le cache pour:', url.pathname);
        return caches.match(req).then((cachedRes) => {
          if (cachedRes) return cachedRes;
          // Fallback générique vers le dashboard si la page exacte n'est pas dans le cache
          return caches.match('/dashboard').then(dashboardRes => {
            if (dashboardRes) return dashboardRes;
            return new Response(
              `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>TCF Canada Pro - Hors Ligne</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: #fff;"><h1>📡 Mode Hors Connexion</h1><p>Vous n'êtes actuellement pas connecté à Internet et cette page n'a pas encore été préchargée.</p><p>Veuillez reconnecter votre appareil ou retourner sur les modules déjà ouverts.</p><a href="/dashboard" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #D52B1E; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Retour au Tableau de Bord</a></body></html>`,
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
          });
        });
      })
    );
    return;
  }

  // 4. STRATÉGIE STALE-WHILE-REVALIDATE : Appels API et requêtes de données Supabase / modules
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      const fetchPromise = fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resToCache = networkRes.clone();
          caches.open(CACHE_DYNAMIC).then((cache) => cache.put(req, resToCache));
        }
        return networkRes;
      }).catch((err) => {
        if (!cachedRes) throw err;
        return cachedRes;
      });

      return cachedRes || fetchPromise;
    })
  );
});

// --- MESSAGERIE CLIENT : Commandes de purge et de contrôle ---
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'PURGE_CACHE') {
    console.log('[SW] Purge manuelle demandée par le client...');
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});
