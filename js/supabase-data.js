// Shared logic for fetching and rendering dynamic content from Supabase
// Uses window.supabaseClient for guaranteed global access

document.addEventListener('DOMContentLoaded', async () => {
  // Only fetch and render dynamic content for frontend pages (skip on admin page)
  if (!window.location.pathname.includes('admin.html')) {
    await fetchAndRenderPlans();
    setupRealtimeSubscription();
  }
});

async function fetchAndRenderPlans() {
  try {
    if (!window.supabaseClient) {
      console.warn("Supabase client is not initialized.");
      return;
    }

    const { data: plans, error } = await window.supabaseClient
      .from('plans')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    window.sitePlans = plans; // Cache globally

    try { renderDynamicPrices(plans); } catch (e) { console.error("Error in renderDynamicPrices:", e); }
    try { syncGlobalPrices(plans); } catch (e) { console.error("Error in syncGlobalPrices:", e); }
    
    if (typeof window.renderContactPageDetails === 'function') {
      try { window.renderContactPageDetails(); } catch (e) { console.error("Error in renderContactPageDetails:", e); }
    }
    if (typeof window.renderFreePageLinks === 'function') {
      try { window.renderFreePageLinks(); } catch (e) { console.error("Error in renderFreePageLinks:", e); }
    }
  } catch (error) {
    console.error('Error fetching plans:', error.message);
  }
}

function renderDynamicPrices(plans) {
  // Find all elements with data-plan-slug attribute
  const elements = document.querySelectorAll('[data-plan-slug]');
  
  elements.forEach(el => {
    const slug = el.getAttribute('data-plan-slug');
    const plan = plans.find(p => p.plan_slug === slug);
    if (plan && plan.price !== undefined) {
      // If the element has a child wrapper for price, update just that. Otherwise update text.
      if (el.querySelector('.price-num')) {
         el.querySelector('.price-num').textContent = plan.price;
      } else {
         // Check if this is the dynamic grid container, we shouldn't overwrite its text if it is
         if(el.id !== 'dynamic-payment-grid' && el.id !== 'dynamic-free-links') {
            el.textContent = plan.price;
         }
      }
    }
  });
}

function syncGlobalPrices(plans) {
  // 1. Sync Footer Text Links
  // Searches for 'Crypto VIP', 'Forex VIP', 'All-in-One' inside footer links and updates them
  const footerLinks = document.querySelectorAll('.site-footer a');
  footerLinks.forEach(link => {
    const text = link.textContent.toLowerCase();
    
    // Map of text identifiers to their slugs
    const linkMap = [
      { id: 'crypto', slug: 'crypto', name: 'Crypto VIP' },
      { id: 'forex', slug: 'forex', name: 'Forex VIP' },
      { id: 'all-in-one', slug: 'all', name: 'All-in-One VIP' },
      { id: 'all', slug: 'all', name: 'All-in-One VIP' }
    ];

    for (const item of linkMap) {
      if (text.includes(item.id)) {
        const plan = plans.find(p => p.plan_slug === item.slug);
        if (plan && plan.price !== undefined) {
           link.textContent = `${item.name} — ${plan.price} USDT`;
        }
        break;
      }
    }
  });

  // 2. Deep sweep: Identify inner pages by checking window path
  const currentPath = window.location.pathname.toLowerCase();
  let currentSlug = null;
  if (currentPath.includes('plan-crypto')) currentSlug = 'crypto';
  if (currentPath.includes('plan-forex')) currentSlug = 'forex';
  if (currentPath.includes('plan-all')) currentSlug = 'all';

  if (currentSlug) {
    const currentPlan = plans.find(p => p.plan_slug === currentSlug);
    if (currentPlan) {
      // Replace hero pills
      const pills = document.querySelectorAll('.sec-pill');
      pills.forEach(pill => {
         if(pill.innerHTML.includes('USDT')) {
            pill.innerHTML = `<i class="fab fa-bitcoin"></i> ${currentPlan.plan_name} — ${currentPlan.price} USDT`;
         }
      });
      
      // Update specific price components safely
      const priceNum = document.querySelector('.price-num');
      if (priceNum) priceNum.textContent = currentPlan.price;
    }
  }
}

function setupRealtimeSubscription() {
  if (!window.supabaseClient) return;

  window.supabaseClient
    .channel('public:plans')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, payload => {
      console.log('Live realtime update triggered:', payload);
      fetchAndRenderPlans();
    })
    .subscribe((status) => {
      console.log("Realtime status:", status);
    });
}

// Ensure copy function exists
window.copyText = function(text) {
  try {
      navigator.clipboard.writeText(text);
      
      const toast = document.getElementById('toast');
      if(toast) {
          toast.textContent = `Copied: ${text}`;
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 3000);
      } else {
          alert("Copied: " + text);
      }
  } catch(e) {
      console.error("Clipboard copy failed", e);
  }
}

window.renderContactPageDetails = function() {
  const grid = document.getElementById('dynamic-payment-grid');
  if (!grid || !window.sitePlans) return;
  
  const slug = grid.getAttribute('data-plan-slug');
  const plan = window.sitePlans.find(p => p.plan_slug === slug);
  
  if (!plan) {
      grid.innerHTML = '<div style="text-align: center; width: 100%; color: var(--text-muted); padding: 40px;">No payment details found.</div>';
      return;
  }

  let html = '';

  // Render Banks
  if (Array.isArray(plan.bank_details) && plan.bank_details.length > 0) {
    plan.bank_details.forEach(bank => {
      html += `
        <div class="pay-card">
          <div class="card-head-row">
            <div class="pay-icon"><i class="fas fa-university"></i></div>
            <h2>Bank Transfer</h2>
          </div>
          <div class="detail-row"><span class="lbl">Account Name</span><span class="val">${bank.holder || ''}</span><button class="copy-btn" onclick="copyText('${bank.holder || ''}')"><i class="fas fa-copy"></i></button></div>
          <div class="detail-row"><span class="lbl">Account Number</span><span class="val">${bank.acc_number || ''}</span><button class="copy-btn" onclick="copyText('${bank.acc_number || ''}')"><i class="fas fa-copy"></i></button></div>
          <div class="detail-row"><span class="lbl">Bank</span><span class="val">${bank.bank_name || ''}</span><button class="copy-btn" onclick="copyText('${bank.bank_name || ''}')"><i class="fas fa-copy"></i></button></div>
          <div class="detail-row"><span class="lbl">Branch</span><span class="val">${bank.branch || ''}</span><button class="copy-btn" onclick="copyText('${bank.branch || ''}')"><i class="fas fa-copy"></i></button></div>
        </div>
      `;
    });
  }

  // Render Binance
  if (Array.isArray(plan.binance_ids) && plan.binance_ids.length > 0) {
    plan.binance_ids.forEach(bin => {
      html += `
        <div class="pay-card">
          <div class="card-head-row">
            <div class="pay-icon binance-icon"><i class="fab fa-bitcoin"></i></div>
            <h2>Binance Pay</h2>
          </div>
          <div class="detail-row"><span class="lbl">${bin.label || 'Binance ID'}</span><span class="val">${bin.id || ''}</span><button class="copy-btn" onclick="copyText('${bin.id || ''}')"><i class="fas fa-copy"></i></button></div>
          <p class="pay-note">Send exactly <strong>${plan.price} USDT</strong> via Binance Pay.</p>
        </div>
      `;
    });
  }

  // Render Links
  if (Array.isArray(plan.group_links) && plan.group_links.length > 0) {
    const isUSDT = plan.plan_slug === 'usdt-config';
    html += `
        <div class="pay-card">
          <div class="card-head-row">
            <div class="pay-icon group-icon"><i class="${isUSDT ? 'fas fa-exchange-alt' : 'fab fa-telegram-plane'}"></i></div>
            <h2>${isUSDT ? 'USDT Transactions' : 'VIP Group Access'}</h2>
          </div>
          <p class="pay-note">${isUSDT ? 'Select whether you want to Buy or Sell USDT below.' : 'After payment, request VIP access below.'}</p>
          <div class="action-btns">
            ${plan.group_links.map(link => {
              let icon = 'telegram-plane';
              let btnClass = 'tg-btn';
              let prefix = 'REQUEST — ';
              
              if (link.type === 'whatsapp') { icon = 'whatsapp'; btnClass = 'wa-btn'; }
              else if (link.type === 'buy') { icon = 'shopping-cart'; btnClass = 'tg-btn'; prefix = ''; }
              else if (link.type === 'sell') { icon = 'money-bill-wave'; btnClass = 'wa-btn'; prefix = ''; }
              
              return `
              <button class="act-btn ${btnClass}" onclick="window.location.href='${link.link}'">
                <i class="${icon.includes('-') || icon === 'whatsapp' ? 'fab' : 'fas'} fa-${icon}"></i> ${prefix}${link.name}
              </button>
              `;
            }).join('')}
          </div>
        </div>
    `;
  }

  // Notice block (dynamic receipt links)
  if (!plan.plan_slug.includes('usdt')) {
    html += `
          <div class="notice-card">
            <i class="fas fa-info-circle notice-icon"></i>
            <div>
              <h3>Important Notice</h3>
              <p>ගෙවීම සිදු කර ගෙවීම් රිසිට්පත WhatsApp හෝ Telegram හරහා අපට එවන්න.<br><br>All payments and join requests are checked and approved by admins.</p>
              <div class="action-btns">
                ${plan.receipt_whatsapp ? `<button class="act-btn wa-btn" onclick="window.location.href='${plan.receipt_whatsapp}'"><i class="fab fa-whatsapp"></i> SEND RECEIPT — WhatsApp</button>` : ''}
                ${plan.receipt_telegram ? `<button class="act-btn tg-btn" onclick="window.location.href='${plan.receipt_telegram}'"><i class="fab fa-telegram-plane"></i> SEND RECEIPT — Telegram</button>` : ''}
              </div>
            </div>
          </div>
    `;
  }

  grid.innerHTML = html;
};

window.renderFreePageLinks = function() {
  const container = document.getElementById('dynamic-free-links');
  if (!container || !window.sitePlans) return;
  
  const slug = container.getAttribute('data-plan-slug');
  const plan = window.sitePlans.find(p => p.plan_slug === slug);
  if (!plan || !Array.isArray(plan.group_links)) return;

  let html = '';
  plan.group_links.forEach(link => {
    const isWa = link.type === 'whatsapp';
    html += `
      <button class="join-btn btn-${isWa ? 'whatsapp' : 'telegram'}" onclick="window.open('${link.link}','_blank')">
        <i class="fab fa-${isWa ? 'whatsapp' : 'telegram-plane'}"></i> JOIN ${link.name.toUpperCase()}
      </button>
    `;
  });

  container.innerHTML = html;
};
