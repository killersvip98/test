const SUPABASE_URL = 'https://yfhipfvqftduvrvfjzir.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmaGlwZnZxZnRkdXZydmZqemlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NjU3MDYsImV4cCI6MjA5OTI0MTcwNn0.wTxo507qgW1y3cjHoeRyQFhfWU9RH5QYTDZ3LXjTBzI';

// Initialize the Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
