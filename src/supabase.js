import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fzjgjnargptclbewiewf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GN7SNBSjvfL-HzWLBahxaw_mhxDFUxI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const storage = {
  async get(key) {
    try {
      const { data, error } = await supabase
        .from('de_storage')
        .select('value')
        .eq('key', key)
        .single();
      if (error || !data) return null;
      return { value: data.value };
    } catch { return null; }
  },
  async set(key, value) {
    try {
      const { error } = await supabase
        .from('de_storage')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
      return { key, value };
    } catch (e) { console.error('storage.set failed', e); return null; }
  },
  async delete(key) {
    try {
      await supabase.from('de_storage').delete().eq('key', key);
      return { key, deleted: true };
    } catch { return null; }
  },
  async list(prefix) {
    try {
      let q = supabase.from('de_storage').select('key');
      if (prefix) q = q.like('key', `${prefix}%`);
      const { data } = await q;
      return { keys: (data || []).map(r => r.key) };
    } catch { return { keys: [] }; }
  }
};
