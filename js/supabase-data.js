// Shared logic for fetching and rendering dynamic content from Supabase

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Fetch all plans once and cache them globally (if not on admin page)
  if (!window.location.pathname.includes('admin.html')) {
    await fetchAndRenderPlans();
    setupRealtimeSubscription();
  }
});

async function fetchAndRenderPlans() {
  try {
    const { data: plans, error } = await supabase
      .from('plans')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    window.sitePlans = plans; // Cache for other scripts
    renderDynamicPrices(plans);
    renderFooterPrices(plans);
    
    if (typeof window.renderContactPageDetails === 'function') {
      window.renderContactPageDetails();
    }
    if (typeof window.renderFreePageLinks === 'function') {
      window.renderFreePageLinks();
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
      el.textContent = plan.price;
    }
  });
}

function renderFooterPrices(plans) {
  const footerLinks = document.querySelectorAll('[data-footer-plan-slug]');
  footerLinks.forEach(link => {
    const slug = link.getAttribute('data-footer-plan-slug');
    const plan = plans.find(p => p.plan_slug === slug);
    if (plan && plan.price !== undefined) {
      // Keep the existing text structure, just update the price
      if (slug === 'crypto') link.textContent = `Crypto VIP — ${plan.price} USDT`;
      if (slug === 'forex') link.textContent = `Forex VIP — ${plan.price} USDT`;
      if (slug === 'all') link.textContent = `All-in-One — ${plan.price} USDT`;
    }
  });
}

function setupRealtimeSubscription() {
  supabase
    .channel('public:plans')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, payload => {
      console.log('Realtime update received:', payload);
      fetchAndRenderPlans();
    })
    .subscribe();
}

window.renderContactPageDetails = function() {
  const grid = document.getElementById('dynamic-payment-grid');
  if (!grid || !window.sitePlans) return;
  
  const slug = grid.getAttribute('data-plan-slug');
  const plan = window.sitePlans.find(p => p.plan_slug === slug);
  if (!plan) return;

  let html = '';

  // Render Banks
  if (plan.bank_details && plan.bank_details.length > 0) {
    plan.bank_details.forEach(bank => {
      html += `
        <div class="pay-card">
          <div class="card-head-row">
            <div class="pay-icon"><i class="fas fa-university"></i></div>
            <h2>Bank Transfer</h2>
          </div>
          <div class="detail-row"><span class="lbl">Account Name</span><span class="val">${bank.holder}</span><button class="copy-btn" onclick="copyText('${bank.holder}')"><i class="fas fa-copy"></i></button></div>
          <div class="detail-row"><span class="lbl">Account Number</span><span class="val">${bank.acc_number}</span><button class="copy-btn" onclick="copyText('${bank.acc_number}')"><i class="fas fa-copy"></i></button></div>
          <div class="detail-row"><span class="lbl">Bank</span><span class="val">${bank.bank_name}</span><button class="copy-btn" onclick="copyText('${bank.bank_name}')"><i class="fas fa-copy"></i></button></div>
          <div class="detail-row"><span class="lbl">Branch</span><span class="val">${bank.branch}</span><button class="copy-btn" onclick="copyText('${bank.branch}')"><i class="fas fa-copy"></i></button></div>
        </div>
      `;
    });
  }

  // Render Binance
  if (plan.binance_ids && plan.binance_ids.length > 0) {
    plan.binance_ids.forEach(bin => {
      html += `
        <div class="pay-card">
          <div class="card-head-row">
            <div class="pay-icon binance-icon"><i class="fab fa-bitcoin"></i></div>
            <h2>Binance Pay</h2>
          </div>
          <div class="detail-row"><span class="lbl">${bin.label}</span><span class="val">${bin.id}</span><button class="copy-btn" onclick="copyText('${bin.id}')"><i class="fas fa-copy"></i></button></div>
          <p class="pay-note">Send exactly <strong>${plan.price} USDT</strong> via Binance Pay.</p>
        </div>
      `;
    });
  }

  // Render Links
  if (plan.group_links && plan.group_links.length > 0) {
    const isUSDT = plan.plan_slug === 'usdt';
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

  grid.innerHTML = html;
};

window.renderFreePageLinks = function() {
  const container = document.getElementById('dynamic-free-links');
  if (!container || !window.sitePlans) return;
  
  const slug = container.getAttribute('data-plan-slug');
  const plan = window.sitePlans.find(p => p.plan_slug === slug);
  if (!plan || !plan.group_links) return;

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
