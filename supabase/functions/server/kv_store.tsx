import { createClient } from "@supabase/supabase-js";

const client = () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key);
};

// Set stores a key-value pair in the database.
export const set = async (key: string, value: any): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_f9caf0ac").upsert({
    key,
    value,
  });
  if (error) {
    throw new Error(error.message);
  }
};

// Get retrieves a key-value pair from the database.
export const get = async (key: string): Promise<any> => {
  const supabase = client();
  const { data, error } = await supabase
    .from("kv_store_f9caf0ac")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data?.value;
};

// Delete deletes a key-value pair from the database.
export const del = async (key: string): Promise<void> => {
  const supabase = client();
  const { error } = await supabase
    .from("kv_store_f9caf0ac")
    .delete()
    .eq("key", key);
  if (error) {
    throw new Error(error.message);
  }
};

// Sets multiple key-value pairs in the database.
export const mset = async (keys: string[], values: any[]): Promise<void> => {
  const supabase = client();
  const { error } = await supabase
    .from("kv_store_f9caf0ac")
    .upsert(keys.map((k, i) => ({ key: k, value: values[i] })));
  if (error) {
    throw new Error(error.message);
  }
};

// Gets multiple key-value pairs from the database.
export const mget = async (keys: string[]): Promise<any[]> => {
  const supabase = client();
  const { data, error } = await supabase
    .from("kv_store_f9caf0ac")
    .select("value")
    .in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};

// Deletes multiple key-value pairs from the database.
export const mdel = async (keys: string[]): Promise<void> => {
  const supabase = client();
  const { error } = await supabase
    .from("kv_store_f9caf0ac")
    .delete()
    .in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
};

// Search for key-value pairs by prefix - FIXED: Now returns full row objects
export const getByPrefix = async (
  prefix: string
): Promise<Array<{ key: string; value: any }>> => {
  const supabase = client();
  const { data, error } = await supabase
    .from("kv_store_f9caf0ac")
    .select("key, value")
    .like("key", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
};
