/**
 * ==============================================================================
 * SPENDLY - SMART EXPENSE MANAGER
 * File: js/app.js
 * Description: Main application entry point, page routing, form validation,
 *              theme switching, CSV export, and global event coordination.
 * Concepts: DOMContentLoaded, Event Delegation, Form Validation, CSV Generation,
 *           SPA View Switching, LocalStorage sync.
 * ==============================================================================
 */

// Active view state
let currentPage = 'dashboard';

// Toast timer reference
let toastTimeout = null;

/**
 * MASTER RENDER FUNCTION: Synchronizes all views and components with current data.
 */
function render() {
  // 1. Update filter options dropdown
  if (typeof populateMonthFilterOptions === 'function') {
    populateMonthFilterOptions();
  }

  // 2. Render Dashboard calculations and recent lists
  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }

  // 3. Render Transactions table & filter counts
  if (typeof renderTransactions === 'function') {
    renderTransactions();
  }

  // 4. Render Analytics charts & insights
  if (typeof renderAnalytics === 'function') {
    renderAnalytics();
  }
}

/**
 * Switches the visible single-page view.
 * 
 * @param {string} pageId - 'dashboard' | 'transactions' | 'add-expense' | 'analytics' | 'budget' | 'settings'
 */
function switchPage(pageId) {
  currentPage = pageId;

  // 1. Hide all page views
  const views = document.querySelectorAll('.page-view');
  views.forEach(v => v.classList.remove('active'));

  // 2. Show targeted view
  const targetView = document.getElementById(`view-${pageId}`);
  if (targetView) {
    targetView.classList.add('active');
  }

  // 3. Update sidebar active nav item
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    if (item.dataset.page === pageId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 4. Update top bar heading
  const titleMap = {
    'dashboard': 'Dashboard',
    'transactions': 'Transactions',
    'add-expense': 'Expense Entry',
    'analytics': 'Spending Analytics',
    'budget': 'Budget Planner',
    'settings': 'Settings & Preferences'
  };

  const pageTitleEl = document.getElementById('current-page-title');
  if (pageTitleEl) {
    pageTitleEl.textContent = titleMap[pageId] || 'Dashboard';
  }

  // 5. If switching to transactions or analytics, ensure up-to-date render
  if (pageId === 'transactions') {
    renderTransactions();
  } else if (pageId === 'analytics') {
    renderAnalytics();
  }

  // 6. Close mobile sidebar if open
  closeMobileSidebar();

  // 7. Scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Toggles between Sage Light and Forest Dark themes.
 * 
 * @param {string} [forceTheme] - Optional 'light' or 'dark' override
 */
function toggleTheme(forceTheme) {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = forceTheme || (currentTheme === 'light' ? 'dark' : 'light');

  // Update HTML attribute
  document.documentElement.setAttribute('data-theme', newTheme);

  // Save to LocalStorage
  saveTheme(newTheme);

  // Update button labels
  const themeTextEl = document.querySelector('.theme-btn-text');
  if (themeTextEl) {
    themeTextEl.textContent = newTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
  }

  // Update settings page choice buttons
  const choiceBtns = document.querySelectorAll('.theme-choice-btn');
  choiceBtns.forEach(btn => {
    if (btn.dataset.themeChoice === newTheme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * EXPORT CSV: Generates and downloads a .csv file of all recorded expenses.
 * Demonstrates: String manipulation, Blob API, Object URL creation, programmatic click.
 */
function exportCSV() {
  if (!expenses || expenses.length === 0) {
    showToast('No expense records available to export.', 'warning');
    return;
  }

  // CSV Header Row
  const headers = ['Transaction ID', 'Title', 'Amount (INR)', 'Category', 'Date', 'Payment Method', 'Notes'];

  // Map each expense to an escaped CSV row
  const rows = expenses.map(exp => {
    return [
      `"${exp.id}"`,
      `"${exp.title.replace(/"/g, '""')}"`,
      Number(exp.amount).toFixed(2),
      `"${exp.category}"`,
      `"${exp.date}"`,
      `"${exp.payment}"`,
      `"${(exp.description || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows].join('\r\n');

  // Create a Blob with UTF-8 encoding
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Programmatically trigger download
  const dateStamp = new Date().toISOString().split('T')[0];
  const downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', url);
  downloadLink.setAttribute('download', `spendly_expenses_${dateStamp}.csv`);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // Release object URL
  URL.revokeObjectURL(url);

  showToast(`Exported ${expenses.length} records to CSV successfully!`, 'success');
}

/**
 * Validates the Add/Edit Expense form fields before submission.
 * 
 * @returns {boolean} True if all validations pass
 */
function validateExpenseForm() {
  clearFormValidationErrors();
  let isValid = true;

  const titleInput = document.getElementById('expense-title');
  const amountInput = document.getElementById('expense-amount');
  const categorySelect = document.getElementById('expense-category');
  const dateInput = document.getElementById('expense-date');
  const paymentSelect = document.getElementById('expense-payment');

  const titleError = document.getElementById('error-title');
  const amountError = document.getElementById('error-amount');
  const categoryError = document.getElementById('error-category');
  const dateError = document.getElementById('error-date');
  const paymentError = document.getElementById('error-payment');

  // 1. Title validation: Not empty, at least 2 characters
  if (!titleInput.value || titleInput.value.trim().length < 2) {
    titleError.textContent = 'Please enter a valid expense title (at least 2 characters).';
    titleInput.focus();
    isValid = false;
  }

  // 2. Amount validation: Must be a positive number greater than 0
  const amountVal = parseFloat(amountInput.value);
  if (isNaN(amountVal) || amountVal <= 0) {
    amountError.textContent = 'Please enter an amount greater than ₹0.';
    if (isValid) amountInput.focus();
    isValid = false;
  }

  // 3. Category validation: Must select an option
  if (!categorySelect.value) {
    categoryError.textContent = 'Please select an expense category.';
    if (isValid) categorySelect.focus();
    isValid = false;
  }

  // 4. Date validation: Must not be empty
  if (!dateInput.value) {
    dateError.textContent = 'Please select a valid date.';
    if (isValid) dateInput.focus();
    isValid = false;
  }

  // 5. Payment validation: Must select payment mode
  if (!paymentSelect.value) {
    paymentError.textContent = 'Please choose a payment method.';
    if (isValid) paymentSelect.focus();
    isValid = false;
  }

  return isValid;
}

/**
 * Handles submission of the Add/Edit Expense form.
 * 
 * @param {Event} e 
 */
function handleExpenseFormSubmit(e) {
  e.preventDefault();

  if (!validateExpenseForm()) {
    return;
  }

  const idInput = document.getElementById('expense-id');
  const titleInput = document.getElementById('expense-title');
  const amountInput = document.getElementById('expense-amount');
  const categorySelect = document.getElementById('expense-category');
  const dateInput = document.getElementById('expense-date');
  const paymentSelect = document.getElementById('expense-payment');
  const descTextarea = document.getElementById('expense-description');

  const formData = {
    title: titleInput.value,
    amount: amountInput.value,
    category: categorySelect.value,
    date: dateInput.value,
    payment: paymentSelect.value,
    description: descTextarea.value
  };

  const isEditing = idInput.value !== '';

  if (isEditing) {
    // Update existing record
    updateExpenseRecord(idInput.value, formData);
    resetExpenseForm();
    switchPage('transactions');
  } else {
    // Add new record
    addExpense(formData);
    resetExpenseForm();
    switchPage('dashboard');
  }
}

/**
 * Displays a toast notification on the bottom-right corner.
 * 
 * @param {string} message 
 * @param {string} [type='info'] - 'success' | 'warning' | 'error' | 'info'
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Clear previous timeout
  if (toastTimeout) clearTimeout(toastTimeout);

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: '💡'
  };

  toast.innerHTML = `
    <span>${iconMap[type] || '💡'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;

  // Close handler
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  // Clear existing toasts and append new
  container.innerHTML = '';
  container.appendChild(toast);

  // Auto remove after 4.5 seconds
  toastTimeout = setTimeout(() => {
    toast.remove();
  }, 4500);
}

/**
 * Displays a toast notification with an interactive "Undo" button.
 * Specifically used after deleting an expense.
 * 
 * @param {string} message 
 * @param {string} undoCallbackName 
 */
function showToastWithUndo(message, undoCallbackName = 'undoDelete') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  if (toastTimeout) clearTimeout(toastTimeout);

  const toast = document.createElement('div');
  toast.className = 'toast toast-warning';
  toast.innerHTML = `
    <span>🗑️</span>
    <span class="toast-message">${message}</span>
    <button class="toast-undo-btn" id="toast-undo-action">Undo</button>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;

  // Attach Undo click listener
  const undoBtn = toast.querySelector('#toast-undo-action');
  undoBtn.addEventListener('click', () => {
    if (typeof window[undoCallbackName] === 'function') {
      window[undoCallbackName]();
    }
    toast.remove();
  });

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  container.innerHTML = '';
  container.appendChild(toast);

  // Give user 6 seconds to undo deletion
  toastTimeout = setTimeout(() => {
    toast.remove();
    // Invalidate undo buffer after timeout
    lastDeletedExpense = null;
  }, 6000);
}

/**
 * Opens mobile sidebar navigation drawer.
 */
function openMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.add('open');
  if (overlay) overlay.classList.add('active');
}

/**
 * Closes mobile sidebar navigation drawer.
 */
function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
}

/**
 * Updates top bar date string to today's date.
 */
function updateCurrentDateDisplay() {
  const dateEl = document.getElementById('current-date-display');
  if (!dateEl) return;

  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  dateEl.textContent = now.toLocaleDateString('en-IN', options);
}

/**
 * Attaches all DOM event listeners once document is ready.
 */
function setupEventListeners() {
  // 1. Navigation item clicks
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = item.dataset.page;
      if (targetPage) switchPage(targetPage);
    });
  });

  // 2. Buttons with [data-nav-target] (e.g., Quick Add, Analytics link, View All)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-nav-target]');
    if (trigger) {
      e.preventDefault();
      const target = trigger.dataset.navTarget;
      if (target) switchPage(target);
    }
  });

  // 3. Quick Add Expense buttons
  const quickAddBtns = document.querySelectorAll('.quick-add-trigger');
  quickAddBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      resetExpenseForm();
      switchPage('add-expense');
    });
  });

  // 4. Form Submission & Reset
  const expenseForm = document.getElementById('expense-form');
  if (expenseForm) {
    expenseForm.addEventListener('submit', handleExpenseFormSubmit);
  }

  const formResetBtn = document.getElementById('form-reset-btn');
  if (formResetBtn) {
    formResetBtn.addEventListener('click', () => {
      resetExpenseForm();
    });
  }

  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      resetExpenseForm();
      switchPage('transactions');
    });
  }

  // 5. Description textarea character counter
  const descTextarea = document.getElementById('expense-description');
  const charCounter = document.getElementById('char-counter');
  if (descTextarea && charCounter) {
    descTextarea.addEventListener('input', () => {
      charCounter.textContent = descTextarea.value.length;
    });
  }

  // 6. Transaction Table Event Delegation (Edit & Delete buttons)
  const tbody = document.getElementById('transactions-tbody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const button = e.target.closest('.btn-table-action');
      if (!button) return;

      const id = button.dataset.id;
      const action = button.dataset.action;

      if (action === 'edit') {
        editExpense(id);
      } else if (action === 'delete') {
        requestDeleteExpense(id);
      }
    });
  }

  // 7. Transactions Filter & Search Inputs
  const searchInput = document.getElementById('filter-search');
  const categoryFilter = document.getElementById('filter-category');
  const monthFilter = document.getElementById('filter-month');
  const sortFilter = document.getElementById('filter-sort');
  const resetFiltersBtn = document.getElementById('reset-filters-btn');

  if (searchInput) searchInput.addEventListener('input', renderTransactions);
  if (categoryFilter) categoryFilter.addEventListener('change', renderTransactions);
  if (monthFilter) monthFilter.addEventListener('change', renderTransactions);
  if (sortFilter) sortFilter.addEventListener('change', renderTransactions);

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (categoryFilter) categoryFilter.value = 'all';
      if (monthFilter) monthFilter.value = 'all';
      if (sortFilter) sortFilter.value = 'date-desc';
      renderTransactions();
      showToast('Filters reset to default', 'info');
    });
  }

  // 8. Delete Confirmation Modal Actions
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const deleteModal = document.getElementById('delete-modal');

  if (cancelDeleteBtn && deleteModal) {
    cancelDeleteBtn.addEventListener('click', () => {
      deleteModal.classList.add('hidden');
      pendingDeleteId = null;
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      if (pendingDeleteId) {
        deleteExpense(pendingDeleteId);
      }
    });
  }

  // 9. Budget Planner Form Submission
  const budgetForm = document.getElementById('budget-update-form');
  const budgetInput = document.getElementById('monthly-budget-input');
  if (budgetForm && budgetInput) {
    budgetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      updateBudget(budgetInput.value);
    });
  }

  // 10. Theme Toggle Buttons
  const headerThemeBtn = document.getElementById('header-theme-toggle');
  const mobileThemeBtn = document.getElementById('mobile-theme-toggle');
  const sidebarThemeBtn = document.getElementById('sidebar-theme-toggle');

  if (headerThemeBtn) headerThemeBtn.addEventListener('click', () => toggleTheme());
  if (mobileThemeBtn) mobileThemeBtn.addEventListener('click', () => toggleTheme());
  if (sidebarThemeBtn) sidebarThemeBtn.addEventListener('click', () => toggleTheme());

  const themeChoiceBtns = document.querySelectorAll('.theme-choice-btn');
  themeChoiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleTheme(btn.dataset.themeChoice);
    });
  });

  // 11. CSV Export Buttons
  const exportBtn1 = document.getElementById('export-csv-btn');
  const exportBtn2 = document.getElementById('settings-export-csv-btn');
  if (exportBtn1) exportBtn1.addEventListener('click', exportCSV);
  if (exportBtn2) exportBtn2.addEventListener('click', exportCSV);

  // 12. Load Sample Data Button (Settings Page)
  const loadSampleBtn = document.getElementById('load-sample-btn');
  if (loadSampleBtn) {
    loadSampleBtn.addEventListener('click', () => {
      expenses = getSampleExpenses();
      saveExpenses(expenses);
      render();
      showToast('Loaded demo student expenses successfully!', 'success');
    });
  }

  // 13. Clear All Expenses (Danger Zone Modal)
  const clearAllBtn = document.getElementById('clear-all-data-btn');
  const clearModal = document.getElementById('clear-all-modal');
  const cancelClearBtn = document.getElementById('cancel-clear-btn');
  const confirmClearBtn = document.getElementById('confirm-clear-btn');

  if (clearAllBtn && clearModal) {
    clearAllBtn.addEventListener('click', () => {
      clearModal.classList.remove('hidden');
    });
  }

  if (cancelClearBtn && clearModal) {
    cancelClearBtn.addEventListener('click', () => {
      clearModal.classList.add('hidden');
    });
  }

  if (confirmClearBtn && clearModal) {
    confirmClearBtn.addEventListener('click', () => {
      expenses = [];
      clearAllExpensesStorage();
      render();
      clearModal.classList.add('hidden');
      showToast('All expense records have been wiped clean.', 'warning');
    });
  }

  // 14. Mobile Menu Drawer Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileSidebar);

  // Close modals on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (deleteModal && !deleteModal.classList.contains('hidden')) {
        deleteModal.classList.add('hidden');
        pendingDeleteId = null;
      }
      if (clearModal && !clearModal.classList.contains('hidden')) {
        clearModal.classList.add('hidden');
      }
    }
  });
}

/**
 * INITIALIZATION ON DOMContentLoaded:
 * Loads saved state, sets initial dates, applies theme, and triggers master render.
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Expenses state from LocalStorage
  initExpenses();

  // 2. Initialize Budget state from LocalStorage
  initBudget();

  // 3. Load saved theme preference
  const savedTheme = loadTheme();
  toggleTheme(savedTheme);

  // 4. Set current date in top bar
  updateCurrentDateDisplay();

  // 5. Set default date picker in Add Expense form to today's date
  const dateInput = document.getElementById('expense-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // 6. Register all UI event listeners
  setupEventListeners();

  // 7. Perform initial master render
  render();

  console.log('SPENDLY - Smart Expense Manager initialized successfully.');
});

