// js/vip-login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('vip-member-login-btn');
    const modal = document.getElementById('vip-login-modal');
    const closeBtn = document.querySelector('.vip-close');
    const submitBtn = document.getElementById('vip-submit-btn');
    const input = document.getElementById('vip-referral-input');
    const errorMsg = document.getElementById('vip-error');

    if (loginBtn && modal) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            input.value = '';
            errorMsg.style.display = 'none';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    });

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const code = input.value.trim().toUpperCase();
            if (!code) {
                errorMsg.textContent = "Please enter a VIP CODE.";
                errorMsg.style.display = 'block';
                return;
            }

            // Check if code exists in config
            if (typeof VIP_CODES !== 'undefined' && VIP_CODES[code]) {
                // Save to localStorage
                localStorage.setItem('activeVipReferral', code);
                // Redirect to VIP plans page
                window.location.href = 'vip-plans.html';
            } else {
                errorMsg.textContent = "Invalid VIP CODE. Please try again.";
                errorMsg.style.display = 'block';
            }
        });
    }

    // Allow Enter key to submit
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        });
    }
});
