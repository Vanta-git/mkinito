/*
 * The original Godot export expects index.pck and index.wasm as single files.
 * They are stored as <= 3,000,000-byte parts so hosts with per-file limits can serve
 * the game. This worker streams the parts back under the original URLs.
 */
'use strict';

const manifestPromise = fetch('asset-chunks.json', { cache: 'no-store' })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Unable to load asset chunk manifest (${response.status})`);
    }
    return response.json();
  });

self.addEventListener('install', (event) => {
  event.waitUntil(manifestPromise.then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function contentTypeFor(assetName) {
  return assetName.endsWith('.wasm')
    ? 'application/wasm'
    : 'application/octet-stream';
}

async function streamAsset(assetName) {
  const manifest = await manifestPromise;
  const parts = manifest.assets[assetName];
  if (!parts || parts.length === 0) {
    throw new Error(`No chunks configured for ${assetName}`);
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (const part of parts) {
          const response = await fetch(new URL(part.path, self.location.origin));
          if (!response.ok || !response.body) {
            throw new Error(`Unable to load ${part.path} (${response.status})`);
          }
          const reader = response.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': contentTypeFor(assetName),
      'Content-Length': String(parts.reduce((total, part) => total + part.size, 0)),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Cross-Origin-Resource-Policy': 'same-origin',
    },
  });
}

self.addEventListener('fetch', (event) => {
  const assetName = new URL(event.request.url).pathname.split('/').pop();
  if (event.request.method === 'GET' && (assetName === 'index.pck' || assetName === 'index.wasm')) {
    event.respondWith(streamAsset(assetName));
  }
});