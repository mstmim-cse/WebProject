// Toast Notification System
class ToastManager {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  show(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 'info-circle';
    
    toast.innerHTML = `
      <i class="fas fa-${icon} toast-icon"></i>
      <span>${message}</span>
    `;

    this.container.appendChild(toast);

    // Trigger reflow for animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

const toast = new ToastManager();

// Modal System
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// Notifications Dropdown
const notifBtn = document.getElementById('notifBtn');
const notifPanel = document.getElementById('notifPanel');

if (notifBtn && notifPanel) {
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifPanel.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!notifPanel.contains(e.target) && e.target !== notifBtn) {
      notifPanel.classList.remove('active');
    }
  });
}

// Profile Dropdown
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');

if (profileBtn && profileDropdown) {
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('active');
    profileBtn.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!profileDropdown.contains(e.target) && e.target !== profileBtn) {
      profileDropdown.classList.remove('active');
      profileBtn.classList.remove('active');
    }
  });
}

// Mobile Hamburger Menu
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}

// Tab System
function setupTabs() {
  const tabElements = document.querySelectorAll('.tab');
  
  tabElements.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs
      const parent = tab.parentElement;
      parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      
      // Add active to clicked
      tab.classList.add('active');
      
      // Hide all content
      const targetId = tab.getAttribute('data-target');
      const contentContainer = document.getElementById(tab.getAttribute('data-parent'));
      
      if (contentContainer) {
        contentContainer.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Show target content
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      }
    });
  });
}

// Inject About Us Modal and Footer Link
function injectAboutUs() {
  const footers = document.querySelectorAll('footer .container p');
  footers.forEach(p => {
    p.innerHTML += ` | <a href="#" onclick="openModal('aboutUsModal'); return false;" style="color: var(--primary); text-decoration: none; font-weight: 500; transition: var(--transition);">About Us</a>`;
  });

  if (!document.getElementById('aboutUsModal')) {
    const modalHtml = `
      <div class="modal-overlay" id="aboutUsModal">
          <div class="modal" style="text-align: center; position: relative;">
              <div class="modal-header" style="justify-content: center;">
                  <h3 style="margin: 0;">About UIU Lost & Found</h3>
                  <i class="fas fa-times modal-close" onclick="closeModal('aboutUsModal')" style="position: absolute; right: 32px; top: 32px;"></i>
              </div>
              <div style="padding: 16px 0;">
                  <i class="fas fa-search-location" style="font-size: 3rem; color: var(--primary); margin-bottom: 24px;"></i>
                  <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 32px;">
                      The official hub for connecting lost and found items across the United International University campus. 
                      Our mission is to help students, faculty, and staff easily report and recover their belongings in a secure and organized way.
                  </p>
                  <button class="btn btn-secondary" onclick="closeModal('aboutUsModal')" style="width: 100%;">Close</button>
              </div>
          </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
}

// Password Visibility Toggle
function setupPasswordToggles() {
  const toggles = document.querySelectorAll('.toggle-password');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          this.classList.remove('fa-eye');
          this.classList.add('fa-eye-slash');
        } else {
          input.type = 'password';
          this.classList.remove('fa-eye-slash');
          this.classList.add('fa-eye');
        }
      }
    });
  });
}

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  injectAboutUs();
  setupPasswordToggles();
});
