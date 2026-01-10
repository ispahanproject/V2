const CACHE_NAME = 'copilot-v2-cache-v1';
const ASSETS = [
    './',
    './index.html',
    './v2_copilot.html',
    './v2_style.css',
    './v2_script.js',
    './manifest.json',
    // 他に必要なファイルがあればここに追加（例: flight_db2.jsなど）
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=JetBrains+Mono:wght@700&display=swap'
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});