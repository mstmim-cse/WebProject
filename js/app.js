// Main App Logic

// Theme Toggle
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  if (themeToggle) {
    themeToggle.checked = currentTheme === 'dark';
    
    themeToggle.addEventListener('change', (e) => {
      const newTheme = e.target.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
}

// Render Item Card
function createItemCard(item) {
  const badgeClass = `badge-${item.type}`;
  const badgeText = item.type.charAt(0).toUpperCase() + item.type.slice(1);
  
  // Pass stringified item to securely handle data, or use global lookup. For simplicity, passing ID.
  return `
    <div class="card item-card-clickable" onclick="openItemDetails(${item.id})">
      <img src="${item.image}" alt="${item.title}" class="card-img" loading="lazy" />
      <div class="card-body">
        <div class="mb-1"><span class="badge ${badgeClass}">${badgeText}</span></div>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-text">${item.description}</p>
        <div class="card-footer" style="padding-top: 12px;">
          <span style="font-size: 0.875rem; color: var(--text-secondary);">
            <i class="fas fa-map-marker-alt"></i> ${item.location}
          </span>
          <span style="font-size: 0.75rem; color: var(--text-secondary);">
            <i class="fas fa-clock"></i> Today
          </span>
        </div>
      </div>
    </div>
  `;
}

// Render Dashboard Items
function renderDashboard() {
  const grid = document.getElementById('itemsGrid');
  if (!grid) return;
  
  // Show skeletons
  grid.innerHTML = Array(6).fill(`
    <div class="card">
      <div class="skeleton skeleton-img"></div>
      <div class="card-body">
        <div class="skeleton skeleton-text short"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
      </div>
    </div>
  `).join('');

  // Simulate network delay
  setTimeout(() => {
    filterAndRender();
  }, 800);
}

// Filter Logic
function filterAndRender() {
  const grid = document.getElementById('itemsGrid');
  if (!grid) return;

  const typeFilter = document.getElementById('typeFilter')?.value || 'all';
  const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
  const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';

  let filtered = items.filter(item => {
    const matchType = typeFilter === 'all' || item.type === typeFilter;
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchSearch = item.title.toLowerCase().includes(searchInput) || item.description.toLowerCase().includes(searchInput);
    return matchType && matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-search"></i>
        <h3>No items found</h3>
        <p>Try adjusting your filters or search term.</p>
      </div>
    `;
  } else {
    grid.innerHTML = filtered.map(createItemCard).join('');
  }
}

// Setup Filters
function setupFilters() {
  const filters = ['typeFilter', 'categoryFilter', 'searchInput'];
  filters.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', filterAndRender);
      el.addEventListener('change', filterAndRender);
    }
  });
}

// Item Details Modal Logic
function openItemDetails(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const modal = document.getElementById('itemDetailsModal');
  if (!modal) return;

  // Populate modal data
  document.getElementById('detailImage').src = item.image;
  document.getElementById('detailTitle').textContent = item.title;
  document.getElementById('detailDescription').textContent = item.description;
  document.getElementById('detailLocation').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${item.location}`;
  
  const badge = document.getElementById('detailBadge');
  badge.className = `badge badge-${item.type}`;
  badge.textContent = item.type.charAt(0).toUpperCase() + item.type.slice(1);

  const claimBtn = document.getElementById('detailClaimBtn');
  claimBtn.textContent = item.type === 'lost' ? 'I Found This' : 'Claim Item';
  
  // Override onclick to pass itemId and check auth
  claimBtn.onclick = () => {
    requireAuth(() => {
      closeModal('itemDetailsModal');
      openClaimModal(itemId);
    });
  };

  openModal('itemDetailsModal');
}

// Claim Modal Logic
function openClaimModal(itemId) {
  openModal('claimModal');
  const claimForm = document.getElementById('claimForm');
  if(claimForm) {
    claimForm.onsubmit = (e) => {
      e.preventDefault();
      closeModal('claimModal');
      toast.show('Claim request submitted successfully!');
    }
  }
}

// Post Item Form
function setupPostForm() {
  const form = document.getElementById('postForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      requireAuth(() => {
        toast.show('Item posted successfully!');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      });
    });
  }

  // Setup Drag & Drop
  const dropArea = document.getElementById('dropArea');
  const fileInput = document.getElementById('fileInput');

  if (dropArea && fileInput) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => {
        dropArea.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => {
        dropArea.classList.remove('dragover');
      }, false);
    });

    dropArea.addEventListener('drop', (e) => {
      let dt = e.dataTransfer;
      let files = dt.files;
      handleFiles(files);
    });

    dropArea.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', function() {
      handleFiles(this.files);
    });

    function handleFiles(files) {
      if (files.length > 0) {
        dropArea.innerHTML = `<i class="fas fa-image drag-drop-icon" style="color: var(--primary)"></i><p>Selected: ${files[0].name}</p>`;
      }
    }
  }
}

// Auth Simulation
// Initialize from localStorage, default to false if not set
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

// Temporary override for development if user wants it true initially, but requested is simulation
// If it's the first time visiting, maybe set to true for demo purposes? We'll leave it as actual state.
if (localStorage.getItem('isLoggedIn') === null) {
  isLoggedIn = true; // Defaulting to true for demo purposes
  localStorage.setItem('isLoggedIn', 'true');
}

function requireAuth(actionCallback) {
  if (isLoggedIn) {
    actionCallback();
  } else {
    toast.show('Please log in to continue', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
  }
}

// Attach auth check to comment/reaction globally
window.handleRestrictedAction = function(actionName) {
  requireAuth(() => {
    toast.show(`${actionName} successful!`);
  });
};

function initAuth() {
  const loggedOutState = document.getElementById('loggedOutState');
  const loggedInState = document.getElementById('loggedInState');
  const logoutBtn = document.getElementById('logoutBtn');
  
  // Protect specific navigation links
  const protectedLinks = document.querySelectorAll('a[href="post.html"], a[href="dashboard.html"], a[href="profile.html"]');
  protectedLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (!isLoggedIn) {
        e.preventDefault();
        requireAuth(() => {
          window.location.href = link.getAttribute('href');
        });
      }
    });
  });

  // Intercept login and signup forms
  const authForms = document.querySelectorAll('form[action="dashboard.html"]');
  authForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      localStorage.setItem('isLoggedIn', 'true');
      isLoggedIn = true;
      if(typeof toast !== 'undefined' && toast.show) {
        toast.show('Authentication successful!');
      }
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    });
  });

  function updateAuthState() {
    if (isLoggedIn) {
      if(loggedOutState) loggedOutState.style.display = 'none';
      if(loggedInState) loggedInState.style.display = 'flex';
    } else {
      if(loggedOutState) loggedOutState.style.display = 'block';
      if(loggedInState) loggedInState.style.display = 'none';
    }
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }

  updateAuthState();

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      isLoggedIn = false;
      updateAuthState();
      if(typeof toast !== 'undefined' && toast.show) {
        toast.show('Logged out successfully');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
      }
    });
  }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initAuth();
  
  // Page level protection
  const restrictedPages = ['dashboard.html', 'post.html', 'profile.html', 'settings.html'];
  const currentPage = window.location.pathname.split('/').pop();
  if (restrictedPages.includes(currentPage) && !isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }
  
  // Initialize specific page logic
  if (window.location.pathname.includes('dashboard.html')) {
    renderDashboard();
    setupFilters();
  }
  
  if (window.location.pathname.includes('post.html')) {
    setupPostForm();
  }
});
