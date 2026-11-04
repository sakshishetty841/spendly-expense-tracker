/**
 * ==============================================================================
 * SPENDLY - SMART EXPENSE MANAGER
 * File: js/expenses.js
 * Description: Core expense management, CRUD operations, filters, search & sort.
 * Concepts: map(), filter(), reduce(), sort(), find(), Event Delegation
 * ==============================================================================
 */

// Global state holding current expenses array
let expenses = [];

// Stores the most recently deleted item for the Undo feature
let lastDeletedExpense = null;

// Temporary variable to hold the ID of the expense pending deletion confirmation
let pendingDeleteId = null;

/**
 * Category emoji mapping for visual flair.
 */
const CATEGORY_ICONS = {
  Food: '🍽️',
  Shopping: '🛍️',
  Travel: '🚌',
  Education: '📚',
  Entertainment: '🎬',
  Bills: '💡',
  Other: '📦'
};

/**
 * Payment method icon mapping.
 */
const PAYMENT_ICONS = {
  UPI: '📱',
  Cash: '💵',
  'Debit Card': '💳',
  'Credit Card': '💳',
  Other: '🌐'
};

/**
 * Formats a currency amount into standard Indian Rupee notation (₹).
 * Example: 1540 -> ₹1,540.00
 * 
 * @param {number} amount 
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into a friendly date.
 * Example: '2026-11-04' -> '04 Nov 2026'
 * 
 * @param {string} dateString 
 * @returns {string}
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[month]} ${year}`;
  }
  return dateString;
}

/**
 * Initializes the expenses state from storage.
 */
function initExpenses() {
  expenses = loadExpenses();
}

/**
 * CREATE: Adds a new expense record to the list.
 * Demonstrates: Object creation, array.unshift(), LocalStorage persistence.
 * 
 * @param {Object} expenseData - Form fields { title, amount, category, date, payment, description }
 * @returns {boolean} True if successfully added
 */
function addExpense(expenseData) {
  // Generate a unique ID using timestamp and random string
  const uniqueId = 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

  const newExpense = {
    id: uniqueId,
    title: expenseData.title.trim(),
    amount: parseFloat(expenseData.amount),
    category: expenseData.category,
    date: expenseData.date,
    payment: expenseData.payment,
    description: (expenseData.description || '').trim()
  };

  // Add the new expense to the beginning of the array
  expenses.unshift(newExpense);

  // Persist to LocalStorage
  saveExpenses(expenses);

  // Re-render UI
  if (typeof render === 'function') {
    render();
  }

  showToast(`Added "${newExpense.title}" (${formatCurrency(newExpense.amount)})`, 'success');
  return true;
}

/**
 * UPDATE: Edits an existing expense record.
 * Demonstrates: Array find() to populate form, updating by reference/index.
 * 
 * @param {string} id - Unique expense ID
 */
function editExpense(id) {
  // Find the expense object by its unique ID using array find()
  const expenseToEdit = expenses.find(exp => exp.id === id);

  if (!expenseToEdit) {
    showToast('Expense record not found.', 'error');
    return;
  }

  // Populate the form fields with existing data
  const formIdInput = document.getElementById('expense-id');
  const titleInput = document.getElementById('expense-title');
  const amountInput = document.getElementById('expense-amount');
  const categorySelect = document.getElementById('expense-category');
  const dateInput = document.getElementById('expense-date');
  const paymentSelect = document.getElementById('expense-payment');
  const descTextarea = document.getElementById('expense-description');
  const charCounter = document.getElementById('char-counter');

  formIdInput.value = expenseToEdit.id;
  titleInput.value = expenseToEdit.title;
  amountInput.value = expenseToEdit.amount;
  categorySelect.value = expenseToEdit.category;
  dateInput.value = expenseToEdit.date;
  paymentSelect.value = expenseToEdit.payment;
  descTextarea.value = expenseToEdit.description || '';
  if (charCounter) {
    charCounter.textContent = descTextarea.value.length;
  }

  // Update Form UI to "Edit Mode"
  const formHeading = document.getElementById('form-heading');
  const formSubheading = document.getElementById('form-subheading');
  const submitBtnText = document.getElementById('submit-btn-text');
  const formModeBadge = document.getElementById('form-mode-badge');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');

  if (formHeading) formHeading.textContent = 'Edit Expense Record';
  if (formSubheading) formSubheading.textContent = 'Modify the details of your saved transaction.';
  if (submitBtnText) submitBtnText.textContent = 'Update Expense';
  if (formModeBadge) {
    formModeBadge.textContent = 'Editing Record';
    formModeBadge.className = 'badge badge-warning';
  }
  if (cancelEditBtn) cancelEditBtn.classList.remove('hidden');

  // Switch view to Add/Edit Expense form tab
  if (typeof switchPage === 'function') {
    switchPage('add-expense');
  }

  // Scroll to form header smoothly
  const formCard = document.querySelector('.form-card');
  if (formCard) {
    formCard.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Updates an existing expense object inside the expenses array.
 * 
 * @param {string} id 
 * @param {Object} updatedData 
 * @returns {boolean}
 */
function updateExpenseRecord(id, updatedData) {
  const index = expenses.findIndex(exp => exp.id === id);

  if (index === -1) {
    showToast('Failed to locate expense to update.', 'error');
    return false;
  }

  // Update properties
  expenses[index].title = updatedData.title.trim();
  expenses[index].amount = parseFloat(updatedData.amount);
  expenses[index].category = updatedData.category;
  expenses[index].date = updatedData.date;
  expenses[index].payment = updatedData.payment;
  expenses[index].description = (updatedData.description || '').trim();

  // Save to LocalStorage
  saveExpenses(expenses);

  // Re-render UI
  if (typeof render === 'function') {
    render();
  }

  showToast(`Updated "${expenses[index].title}" successfully`, 'success');
  return true;
}

/**
 * Resets the Add/Edit form back to default "Create" mode.
 */
function resetExpenseForm() {
  const form = document.getElementById('expense-form');
  if (form) form.reset();

  const formIdInput = document.getElementById('expense-id');
  if (formIdInput) formIdInput.value = '';

  // Reset labels and button text
  const formHeading = document.getElementById('form-heading');
  const formSubheading = document.getElementById('form-subheading');
  const submitBtnText = document.getElementById('submit-btn-text');
  const formModeBadge = document.getElementById('form-mode-badge');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const charCounter = document.getElementById('char-counter');
  const dateInput = document.getElementById('expense-date');

  if (formHeading) formHeading.textContent = 'Add New Expense';
  if (formSubheading) formSubheading.textContent = 'Enter the expense details below to log your transaction.';
  if (submitBtnText) submitBtnText.textContent = 'Save Expense';
  if (formModeBadge) {
    formModeBadge.textContent = 'New Record';
    formModeBadge.className = 'badge badge-accent';
  }
  if (cancelEditBtn) cancelEditBtn.classList.add('hidden');
  if (charCounter) charCounter.textContent = '0';

  // Set default date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // Clear any inline validation error messages
  clearFormValidationErrors();
}

/**
 * Clears form inline error messages and alert banners.
 */
function clearFormValidationErrors() {
  const errorElements = document.querySelectorAll('.field-error');
  errorElements.forEach(el => el.textContent = '');

  const alertBox = document.getElementById('form-alert');
  if (alertBox) {
    alertBox.className = 'alert-box hidden';
    alertBox.textContent = '';
  }
}

/**
 * DELETE: Opens confirmation modal for an expense ID.
 * 
 * @param {string} id - Unique expense ID
 */
function requestDeleteExpense(id) {
  const expenseToDelete = expenses.find(exp => exp.id === id);
  if (!expenseToDelete) return;

  pendingDeleteId = id;

  const modal = document.getElementById('delete-modal');
  const desc = document.getElementById('delete-modal-desc');
  if (desc) {
    desc.textContent = `Are you sure you want to delete "${expenseToDelete.title}" of ${formatCurrency(expenseToDelete.amount)}? You can undo this right after.`;
  }
  if (modal) modal.classList.remove('hidden');
}

/**
 * DELETE: Executes the deletion of the confirmed expense.
 * Demonstrates: Array filter(), saving deleted state for Undo.
 * 
 * @param {string} id - Unique expense ID
 */
function deleteExpense(id) {
  const targetId = id || pendingDeleteId;
  if (!targetId) return;

  const targetIndex = expenses.findIndex(exp => exp.id === targetId);
  if (targetIndex === -1) return;

  // Save for Undo action
  lastDeletedExpense = {
    expense: { ...expenses[targetIndex] },
    originalIndex: targetIndex
  };

  const deletedTitle = expenses[targetIndex].title;
  const deletedAmount = expenses[targetIndex].amount;

  // Use filter() to produce a new array without the deleted item
  expenses = expenses.filter(exp => exp.id !== targetId);

  // Save updated array to LocalStorage
  saveExpenses(expenses);

  // Reset modal state
  pendingDeleteId = null;
  const modal = document.getElementById('delete-modal');
  if (modal) modal.classList.add('hidden');

  // Re-render UI
  if (typeof render === 'function') {
    render();
  }

  // Show Toast with "Undo" button
  showToastWithUndo(
    `Deleted "${deletedTitle}" (${formatCurrency(deletedAmount)})`,
    'undoDelete'
  );
}

/**
 * UNDO: Restores the most recently deleted expense.
 * Demonstrates: Array splice() to restore at original index.
 */
function undoDelete() {
  if (!lastDeletedExpense || !lastDeletedExpense.expense) {
    showToast('No deleted expense available to restore.', 'error');
    return;
  }

  const { expense, originalIndex } = lastDeletedExpense;

  // Insert back at original index (or push if index is out of bounds)
  if (originalIndex >= 0 && originalIndex <= expenses.length) {
    expenses.splice(originalIndex, 0, expense);
  } else {
    expenses.push(expense);
  }

  // Save to LocalStorage
  saveExpenses(expenses);

  // Clear deleted cache
  lastDeletedExpense = null;

  // Re-render UI
  if (typeof render === 'function') {
    render();
  }

  showToast(`Restored "${expense.title}" successfully!`, 'success');
}

/**
 * FILTER: Filters expenses based on search query, category, and month.
 * Demonstrates: Array filter() method chaining.
 * 
 * @returns {Array} Filtered array of expense objects
 */
function filterExpenses() {
  const searchInput = document.getElementById('filter-search');
  const categorySelect = document.getElementById('filter-category');
  const monthSelect = document.getElementById('filter-month');

  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedCategory = categorySelect ? categorySelect.value : 'all';
  const selectedMonth = monthSelect ? monthSelect.value : 'all';

  // Use filter() to apply all conditions
  return expenses.filter(expense => {
    // 1. Search filter: matches title or description
    const titleMatch = expense.title.toLowerCase().includes(searchTerm);
    const descMatch = (expense.description || '').toLowerCase().includes(searchTerm);
    const matchesSearch = searchTerm === '' || titleMatch || descMatch;

    // 2. Category filter
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;

    // 3. Month filter (date format YYYY-MM-DD -> matches YYYY-MM)
    const expenseMonth = expense.date ? expense.date.substring(0, 7) : '';
    const matchesMonth = selectedMonth === 'all' || expenseMonth === selectedMonth;

    return matchesSearch && matchesCategory && matchesMonth;
  });
}

/**
 * SORT: Sorts the filtered array by date or amount.
 * Demonstrates: Array sort() with comparative arrow functions.
 * 
 * @param {Array} list - Array of expense objects to sort
 * @returns {Array} Sorted array
 */
function sortExpenses(list) {
  const sortSelect = document.getElementById('filter-sort');
  const sortCriteria = sortSelect ? sortSelect.value : 'date-desc';

  // Create a shallow copy before sorting so original array is not mutated unexpectedly
  const listCopy = [...list];

  return listCopy.sort((a, b) => {
    switch (sortCriteria) {
      case 'date-desc': // Newest date first
        return new Date(b.date) - new Date(a.date);
      case 'date-asc': // Oldest date first
        return new Date(a.date) - new Date(b.date);
      case 'amount-desc': // Highest amount first
        return b.amount - a.amount;
      case 'amount-asc': // Lowest amount first
        return a.amount - b.amount;
      default:
        return 0;
    }
  });
}

/**
 * Populates the month filter dropdown dynamically based on recorded dates.
 * Demonstrates: Array map(), Set for unique values, sort().
 */
function populateMonthFilterOptions() {
  const monthSelect = document.getElementById('filter-month');
  if (!monthSelect) return;

  const currentSelection = monthSelect.value || 'all';

  // Extract unique YYYY-MM strings using map and Set
  const months = [...new Set(expenses.map(e => e.date ? e.date.substring(0, 7) : ''))]
    .filter(m => m.length === 7)
    .sort()
    .reverse(); // Newest months first

  // Month names lookup
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Build HTML options
  let optionsHtml = '<option value="all">All Months</option>';

  months.forEach(m => {
    const [year, monthNum] = m.split('-');
    const name = monthNames[parseInt(monthNum, 10) - 1];
    const isSelected = m === currentSelection ? 'selected' : '';
    optionsHtml += `<option value="${m}" ${isSelected}>${name} ${year}</option>`;
  });

  monthSelect.innerHTML = optionsHtml;
}

/**
 * READ: Renders the transaction table dynamically.
 * Demonstrates: DOM manipulation, map(), reduce(), event delegation support.
 */
function renderTransactions() {
  const tbody = document.getElementById('transactions-tbody');
  const emptyState = document.getElementById('transactions-empty-state');
  const countLabel = document.getElementById('transactions-count-label');
  const totalLabel = document.getElementById('transactions-total-label');
  const table = document.getElementById('transactions-table');

  if (!tbody) return;

  // 1. Filter and sort expenses
  const filtered = filterExpenses();
  const sorted = sortExpenses(filtered);

  // 2. Calculate filtered total using reduce()
  const filteredTotal = sorted.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // 3. Update count & total indicators
  if (countLabel) {
    countLabel.textContent = `Showing ${sorted.length} of ${expenses.length} transactions`;
  }
  if (totalLabel) {
    totalLabel.textContent = `Total: ${formatCurrency(filteredTotal)}`;
  }

  // 4. Handle empty state
  if (sorted.length === 0) {
    tbody.innerHTML = '';
    if (table) table.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (table) table.classList.remove('hidden');
  if (emptyState) emptyState.classList.add('hidden');

  // 5. Render rows using map() and join()
  const rowsHtml = sorted.map(exp => {
    const catIcon = CATEGORY_ICONS[exp.category] || '🏷️';
    const payIcon = PAYMENT_ICONS[exp.payment] || '💳';
    const notes = exp.description ? `<span class="td-notes">${escapeHtml(exp.description)}</span>` : '';

    return `
      <tr data-id="${exp.id}">
        <td>
          <div class="td-title-cell">
            <span class="td-title">${escapeHtml(exp.title)}</span>
            ${notes}
          </div>
        </td>
        <td>
          <span class="cat-badge">
            <span>${catIcon}</span>
            <span>${escapeHtml(exp.category)}</span>
          </span>
        </td>
        <td>${formatDate(exp.date)}</td>
        <td>
          <span class="badge badge-accent">
            <span>${payIcon}</span>
            <span>${escapeHtml(exp.payment)}</span>
          </span>
        </td>
        <td class="text-right td-amount">${formatCurrency(exp.amount)}</td>
        <td>
          <div class="table-actions-cell">
            <button 
              type="button" 
              class="btn-table-action btn-action-edit" 
              data-id="${exp.id}" 
              data-action="edit" 
              title="Edit Expense" 
              aria-label="Edit ${escapeHtml(exp.title)}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button 
              type="button" 
              class="btn-table-action btn-action-delete" 
              data-id="${exp.id}" 
              data-action="delete" 
              title="Delete Expense" 
              aria-label="Delete ${escapeHtml(exp.title)}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = rowsHtml;
}

/**
 * Escapes HTML characters to prevent XSS issues in user input.
 * 
 * @param {string} str 
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

