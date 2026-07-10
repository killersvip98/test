(function() {
    const _url = 'https://yfhipfvqftduvrvfjzir.supabase.co';
    const _key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmaGlwZnZxZnRkdXZydmZqemlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NjU3MDYsImV4cCI6MjA5OTI0MTcwNn0.wTxo507qgW1y3cjHoeRyQFhfWU9RH5QYTDZ3LXjTBzI';

    // Safely check if the global CDN object exists without triggering re-declaration errors
    if (window.supabase) {
        // Bind the active client explicitly to window.supabaseClient
        window.supabaseClient = window.supabase.createClient(_url, _key);
    } else {
        console.error("Supabase CDN script is not loaded! Make sure <script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'></script> is loaded first.");
    }
})();
