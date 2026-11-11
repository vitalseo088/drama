import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  const url = config?.url || (import.meta as any).env?.VITE_SUPABASE_URL;
  const anonKey = config?.anonKey || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.trim() === '' || anonKey.trim() === '') {
    return null;
  }

  try {
    if (!supabaseClient) {
      supabaseClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return supabaseClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function resetSupabaseClient(config: SupabaseConfig): SupabaseClient | null {
  supabaseClient = null;
  if (!config.url || !config.anonKey) return null;
  try {
    supabaseClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseClient;
  } catch (err) {
    console.error('Error reinitializing Supabase client:', err);
    return null;
  }
}

/**
 * Upload a media file (video or thumbnail) to Supabase Storage bucket
 */
export async function uploadMediaToSupabase(
  file: File,
  bucketName: string,
  config?: SupabaseConfig
): Promise<{ url: string; error?: string }> {
  const client = getSupabaseClient(config);
  if (!client) {
    return {
      url: '',
      error: 'Supabase is not configured yet. Configure URL and Anon Key in Admin Settings.',
    };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}_${cleanFileName}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await client.storage
      .from(bucketName || 'videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { url: '', error: uploadError.message };
    }

    const { data } = client.storage.from(bucketName || 'videos').getPublicUrl(filePath);

    return { url: data.publicUrl };
  } catch (err: any) {
    return { url: '', error: err.message || 'File upload failed' };
  }
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'Please provide both Supabase URL and Anon Key' };
  }

  try {
    const testClient = createClient(url, anonKey);
    const { error } = await testClient.auth.getSession();
    if (error && !error.message.includes('fetch')) {
      return { success: false, message: `Auth check: ${error.message}` };
    }
    return { success: true, message: 'Successfully connected to Supabase project!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Could not connect to Supabase endpoint' };
  }
}
