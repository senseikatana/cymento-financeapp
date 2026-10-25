import process from 'node:process';
import { createAdminClient } from '@insforge/sdk';

let client: ReturnType<typeof createAdminClient> | null = null;

// Cliente admin perezoso: solo se usa server-side (Nitro). Nunca exponer la key al cliente.
export function getInsforge() {
  if (client) return client;

  const baseUrl = process.env.INSFORGE_URL;
  const apiKey = process.env.INSFORGE_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error('Faltan INSFORGE_URL / INSFORGE_API_KEY. Añádelas a .env (ver .env.example).');
  }

  client = createAdminClient({ baseUrl, apiKey });
  return client;
}
