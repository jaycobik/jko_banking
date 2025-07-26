// Global variables
let userData = null;
let selectedAccount = null;
let currentSection = 'dashboard';
let accountToDelete = null;
let isClosing = false;
let isBankingOpen = false;
let balanceChart = null;
let isCreatingChart = false;
let currentLocale = null;

// Locale strings (will be set from server)
let localeStrings = {};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

// Event listeners initialization
function initializeEventListeners() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            switchSection(this.getAttribute('data-section'));
        });
    });

    setupFormHandlers();
    document.addEventListener('keydown', handleKeyboardEvents);
    window.addEventListener('message', handleNUIMessages);
    setupDropdownHandler();
    setupModalHandlers();
}

// Form handlers setup
function setupFormHandlers() {
    const formInputs = [
        { id: 'depositAmount', handler: makeDeposit },
        { id: 'withdrawAmount', handler: makeWithdraw },
        { id: 'transferAmount', handler: makeTransfer },
        { id: 'newAccountName', handler: createAccount }
    ];

    formInputs.forEach(input => {
        const element = document.getElementById(input.id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    input.handler();
                }
            });
        }
    });
}

// Modal handlers setup
function setupModalHandlers() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                const modalId = modal.id;
                hideModal(modalId);
                clearModalInputsForModal(modalId);
            }
        });
        
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    });
}

// Dropdown handler setup
function setupDropdownHandler() {
    const dropdown = document.getElementById('transactionAccountSelect');
    if (dropdown) {
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleTransactionDropdown();
        });
    }

    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('transactionAccountSelect');
        const options = document.getElementById('transactionAccountOptions');
        if (dropdown && options && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
            options.classList.remove('show');
        }
    });
}

// Localization function
function _(key, ...args) {
    if (localeStrings[key]) {
        let str = localeStrings[key];
        args.forEach((arg, index) => {
            str = str.replace('%s', arg);
        });
        return str;
    }
    return key; // Return key if translation not found
}

// Set locale strings from server
function setLocaleStrings(strings) {
    localeStrings = strings;
    updateUIText();
}

// Update UI text with localized strings
function updateUIText() {
    if (!localeStrings || Object.keys(localeStrings).length === 0) {
        return;
    }

    // Main interface elements
    const textMappings = {
        // Header
        'bankingTitle': 'banking_title',
        'depositBtnText': 'deposit_btn',
        'withdrawBtnText': 'withdraw_btn',
        'closeBtnText': 'close',
        
        // Logo section
        'logoTitle': 'banking_title',
        'logoSubtitle': 'online_bank',
        
        // Menu
        'mainMenuTitle': 'menu_title',
        'dashboardTitle': 'menu_dashboard',
        'transactionsTitle': 'menu_transactions',
        'accountsTitle': 'menu_accounts',
        
        // Dashboard cards
        'mainAccountLabel': 'main_account',
        'cashLabel': 'cash',
        'mainAccountBalanceLabel': 'main_account_balance',
        'availableMoneyLabel': 'available_money',
        'mainAccountNumberLabel': 'main_account_number',
        
        // Stats cards
        'accountsCountLabel': 'accounts_count',
        'activeAccountsLabel': 'active_accounts',
        'weeklyTransactionsLabel': 'weekly_transactions',
        'weeklyTransactionsDescLabel': 'weekly_transactions_desc',
        'weeklyBalanceLabel': 'weekly_balance',
        'weeklyBalanceDescLabel': 'weekly_balance_desc',
        
        // Balance history
        'balanceHistoryLabel': 'balance_history',
        'balanceHistoryDescLabel': 'balance_history_desc',
        
        // Recent transactions
        'recentTransactionsLabel': 'recent_transactions',
        'recentTransactionsDescLabel': 'recent_transactions_desc',
        'noRecentTransactionsText': 'no_recent_transactions',
        
        // Transaction history
        'transactionHistoryLabel': 'transaction_history',
        'transactionHistoryDescLabel': 'transaction_history_desc',
        'selectAccountTransactionsLabel': 'select_account_transactions',
        'selectAccountDropdownText': 'select_account',
        'selectAccountTransactionsText': 'select_account_transactions',
        
        // Account management
        'accountManagementLabel': 'account_management',
        'accountManagementDescLabel': 'account_management_desc',
        'newAccountBtnText': 'new_account',
        
        // Deposit modal
        'depositModalTitle': 'deposit_title',
        'depositModalSubtitle': 'deposit_subtitle',
        'selectAccountLabel1': 'select_account',
        'selectAccountOption1': 'select_account',
        'amountLabel1': 'amount',
        'cancelBtn1': 'cancel',
        'depositBtn1': 'deposit_btn',
        
        // Withdraw modal
        'withdrawModalTitle': 'withdraw_title',
        'withdrawModalSubtitle': 'withdraw_subtitle',
        'selectAccountLabel2': 'select_account',
        'selectAccountOption2': 'select_account',
        'amountLabel2': 'amount',
        'cancelBtn2': 'cancel',
        'withdrawBtn2': 'withdraw_btn',
        
        // Transfer modal
        'transferModalTitle': 'transfer_title',
        'transferModalSubtitle': 'transfer_subtitle',
        'fromAccountLabel': 'from_account',
        'selectSourceAccountOption': 'select_source_account',
        'targetAccountNumberLabel': 'target_account_number',
        'amountLabel3': 'amount',
        'noteOptionalLabel': 'note_optional',
        'cancelBtn3': 'cancel',
        'transferBtn': 'transfer',
        
        // Create account modal
        'createAccountModalTitle': 'create_account_title',
        'createAccountModalSubtitle': 'create_account_subtitle',
        'accountNameLabel': 'account_name',
        'cancelBtn4': 'cancel',
        'createBtn': 'create',
        
        // Delete account modal
        'deleteAccountModalTitle': 'delete_account_title',
        'deleteAccountModalSubtitle': 'delete_account_subtitle',
        'deleteAccountWarning': 'delete_account_warning',
        'cancelBtn5': 'cancel',
        'deleteBtn': 'delete'
    };

    // Update all text elements
    Object.keys(textMappings).forEach(elementId => {
        const element = document.getElementById(elementId);
        const localeKey = textMappings[elementId];
        if (element && localeStrings[localeKey]) {
            element.textContent = _(localeKey);
        }
    });

    // Update placeholders
    const placeholderMappings = {
        'depositAmount': 'enter_amount',
        'withdrawAmount': 'enter_amount',
        'transferAmount': 'enter_amount',
        'transferToAccount': 'enter_account_number',
        'transferDescription': 'transfer_description',
        'newAccountName': 'enter_account_name'
    };

    Object.keys(placeholderMappings).forEach(elementId => {
        const element = document.getElementById(elementId);
        const localeKey = placeholderMappings[elementId];
        if (element && localeStrings[localeKey]) {
            element.placeholder = _(localeKey);
        }
    });
}

// Keyboard event handlers
function handleKeyboardEvents(e) {
    if (e.key === 'Escape') {
        e.preventDefault();
        handleEscapeKey();
    }
}

function handleEscapeKey() {
    const dropdown = document.getElementById('transactionAccountSelect');
    const options = document.getElementById('transactionAccountOptions');
    if (dropdown && dropdown.classList.contains('open')) {
        dropdown.classList.remove('open');
        options.classList.remove('show');
        return;
    }

    const openModals = document.querySelectorAll('.modal.show');
    if (openModals.length > 0) {
        openModals.forEach(modal => {
            const modalId = modal.id;
            hideModal(modalId);
            clearModalInputsForModal(modalId);
        });
        return;
    }

    if (isBankingOpen && !isClosing) {
        closeBanking();
    }
}

// NUI Message handler
function handleNUIMessages(event) {
    const data = event.data;
    
    switch(data.type) {
        case 'openBanking':
            openBanking(data.userData);
            break;
        case 'updateData':
            updateUserData(data.userData);
            break;
        case 'forceClose':
            forceBankingClose();
            break;
        case 'setLocale':
            setLocaleStrings(data.strings);
            break;
    }
}

// Banking UI functions
function openBanking(data) {
    if (isClosing) return;
    
    userData = data;
    isClosing = false;
    isBankingOpen = true;
    
    const container = document.getElementById('bankingContainer');
    container.classList.add('show');
    container.style.display = 'block';
    
    switchSection('dashboard');
    updateUI();
    loadMainAccountTransactions();
}

function closeBanking() {
    if (isClosing || !isBankingOpen) return;
    
    isClosing = true;
    isBankingOpen = false;

    closeAllModals();
    
    const container = document.getElementById('bankingContainer');
    container.classList.remove('show');
    
    setTimeout(() => {
        container.style.display = 'none';
    }, 150);
    
    sendNUIMessage('closeBanking', {});
    
    setTimeout(() => {
        isClosing = false;
    }, 500);
}

function forceBankingClose() {
    isClosing = false;
    isBankingOpen = false;
    
    const container = document.getElementById('bankingContainer');
    container.classList.remove('show');
    container.style.display = 'none';
    
    closeAllModals();
    
    const dropdown = document.getElementById('transactionAccountSelect');
    const options = document.getElementById('transactionAccountOptions');
    if (dropdown && options) {
        dropdown.classList.remove('open');
        options.classList.remove('show');
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
        modal.style.display = 'none';
    });
}

function updateUserData(data) {
    userData = data;
    updateUI();
    if (currentSection === 'dashboard') {
        loadMainAccountTransactions();
        createBalanceChart();
    } else if (currentSection === 'transactions' && selectedAccount) {
        loadTransactionHistory();
    }
}

// UI Update functions
function updateUI() {
    if (!userData) return;

    updateUserInfo();
    updateBalances();
    updateAccountSelects();
    updateAccountsList();
    updateDashboardStats();
    resetTransactionAccountSelect();
    updateNewAccountButton();
}

function updateUserInfo() {
    const userName = userData.playerName || _('unknown_player');
    const jobLabel = userData.jobLabel || _('unemployed');
    
    const userNameEl = document.getElementById('userName');
    const userJobEl = document.getElementById('userJob');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (userNameEl) userNameEl.textContent = userName;
    if (userJobEl) userJobEl.textContent = jobLabel;
    
    if (userAvatarEl) {
        const initials = userName.split(' ').map(n => n.charAt(0).toUpperCase()).join('').substring(0, 2);
        userAvatarEl.textContent = initials;
    }
}

function updateBalances() {
    const cashElement = document.getElementById('cashAmount');
    if (cashElement) {
        cashElement.textContent = `$ ${formatNumber(userData.cash || 0)}`;
    }

    const mainAccountBalance = userData.accounts && userData.accounts.length > 0 ? 
        parseFloat(userData.accounts[0].balance || 0) : 0;
    
    const bankBalanceElement = document.getElementById('bankBalance');
    if (bankBalanceElement) {
        bankBalanceElement.textContent = `$ ${formatNumber(mainAccountBalance)}`;
    }

    const accountNumberElement = document.getElementById('accountNumber');
    if (accountNumberElement && userData.accounts && userData.accounts.length > 0) {
        accountNumberElement.textContent = userData.accounts[0].account_number;
    }
}

function updateDashboardStats() {
    const accountsCountElement = document.getElementById('accountsCount');
    if (accountsCountElement && userData.accounts) {
        accountsCountElement.textContent = userData.accounts.length;
    }

    calculateWeeklyTransactions();
    calculateWeeklyBalance();
    createBalanceChart();
}

function updateNewAccountButton() {
    const newAccountBtn = document.querySelector('.new-account-btn');
    if (!newAccountBtn) return;
    
    const accountCount = userData.accounts ? userData.accounts.length : 0;
    const maxAccounts = userData.maxAccounts || 2;
    
    if (accountCount >= maxAccounts) {
        newAccountBtn.classList.add('hidden');
    } else {
        newAccountBtn.classList.remove('hidden');
    }
}

function calculateWeeklyTransactions() {
    if (!userData.accounts || userData.accounts.length === 0) {
        updateWeeklyTransactionsDisplay(0);
        return;
    }

    const mainAccount = userData.accounts[0];
    
    sendNUIMessage('getTransactionHistory', {
        accountId: mainAccount.id
    })
    .then(transactions => {
        if (!transactions || !Array.isArray(transactions)) {
            updateWeeklyTransactionsDisplay(0);
            return;
        }

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const weeklyCount = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.created_at);
            return transactionDate >= weekAgo;
        }).length;

        updateWeeklyTransactionsDisplay(weeklyCount);
    })
    .catch(error => {
        updateWeeklyTransactionsDisplay(0);
    });
}

function updateWeeklyTransactionsDisplay(count) {
    const weeklyTransactionsElement = document.getElementById('weeklyTransactions');
    if (weeklyTransactionsElement) {
        weeklyTransactionsElement.textContent = count.toString();
    }
}

function calculateWeeklyBalance() {
    if (!userData.accounts || userData.accounts.length === 0) {
        updateWeeklyBalanceDisplay(0);
        return;
    }

    const mainAccount = userData.accounts[0];
    
    sendNUIMessage('getTransactionHistory', {
        accountId: mainAccount.id
    })
    .then(transactions => {
        if (!transactions || !Array.isArray(transactions)) {
            updateWeeklyBalanceDisplay(0);
            return;
        }

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const weeklyTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.created_at);
            return transactionDate >= weekAgo;
        });

        let weeklyBalance = 0;
        weeklyTransactions.forEach(transaction => {
            const amount = parseFloat(transaction.amount || 0);
            if (transaction.transaction_type === 'deposit' || transaction.transaction_type === 'transfer_in') {
                weeklyBalance += amount;
            } else if (transaction.transaction_type === 'withdraw' || transaction.transaction_type === 'transfer_out') {
                weeklyBalance -= amount;
            }
        });

        updateWeeklyBalanceDisplay(weeklyBalance);
    })
    .catch(error => {
        updateWeeklyBalanceDisplay(0);
    });
}

function updateWeeklyBalanceDisplay(balance) {
    const weeklyBalanceElement = document.getElementById('weeklyBalance');
    const weeklyBalanceIcon = document.getElementById('weeklyBalanceIcon');
    
    if (weeklyBalanceElement) {
        const formattedBalance = balance >= 0 ? `+$ ${formatNumber(balance)}` : `-$ ${formatNumber(Math.abs(balance))}`;
        weeklyBalanceElement.textContent = formattedBalance;
        
        if (balance >= 0) {
            weeklyBalanceElement.style.color = '#68d391';
        } else {
            weeklyBalanceElement.style.color = '#f56565';
        }
    }
    
    if (weeklyBalanceIcon) {
        if (balance > 0) {
            weeklyBalanceIcon.textContent = '📈';
        } else if (balance < 0) {
            weeklyBalanceIcon.textContent = '📉';
        } else {
            weeklyBalanceIcon.textContent = '💎';
        }
    }
}

function updateAccountSelects() {
    const selects = ['depositAccountSelect', 'withdrawAccountSelect', 'transferFromSelect'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = `<option value="">${_('select_account')}</option>`;
        
        if (userData.accounts) {
            userData.accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = `${account.account_name} - ${formatNumber(account.balance)} (#${account.account_number})`;
                select.appendChild(option);
            });
        }
    });
}

function resetTransactionAccountSelect() {
    const transactionSelect = document.getElementById('transactionAccountSelect');
    const selectedDiv = transactionSelect?.querySelector('.dropdown-selected');
    if (selectedDiv) {
        selectedDiv.textContent = _('select_account');
    }
    selectedAccount = null;
    
    updateTransactionAccountDropdown();
}

function updateAccountsList() {
    const accountsList = document.getElementById('accountsList');
    if (!accountsList || !userData.accounts) return;
    
    accountsList.innerHTML = '';

    userData.accounts.forEach(account => {
        const accountDiv = document.createElement('div');
        accountDiv.className = 'account-card';
        
        const deleteButton = userData.accounts.length > 1 ? 
            `<button class="account-card-btn delete" onclick="showDeleteAccountModal(${account.id})">${_('delete')}</button>` : '';
        
        accountDiv.innerHTML = `
            <div class="account-card-info">
                <div class="account-card-name">${account.account_name}</div>
                <div class="account-card-number">#${account.account_number}</div>
                <div class="account-card-balance">${formatNumber(account.balance)}</div>
            </div>
            <div class="account-card-actions">
                <button class="account-card-btn transfer" onclick="showTransferModalForAccount(${account.id})">
                    ${_('transfer')}
                </button>
                ${deleteButton}
            </div>
        `;
        
        accountsList.appendChild(accountDiv);
    });
}

// Section switching
function switchSection(section) {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeMenuItem = document.querySelector(`.menu-item[data-section="${section}"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }

    document.querySelectorAll('.content-section').forEach(content => {
        content.classList.add('hidden');
    });
    
    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    currentSection = section;

    if (section === 'transactions') {
        updateTransactionAccountDropdown();
    } else if (section === 'dashboard') {
        loadMainAccountTransactions();
        createBalanceChart();
    }
}

// Transaction functions
function toggleTransactionDropdown() {
    const dropdown = document.getElementById('transactionAccountSelect');
    const options = document.getElementById('transactionAccountOptions');
    
    if (!dropdown || !options) return;
    
    const isOpen = dropdown.classList.contains('open');
    
    if (isOpen) {
        dropdown.classList.remove('open');
        options.classList.remove('show');
    } else {
        dropdown.classList.add('open');
        options.classList.add('show');
    }
}

function updateTransactionAccountDropdown() {
    const optionsContainer = document.getElementById('transactionAccountOptions');
    if (!optionsContainer || !userData.accounts) return;
    
    optionsContainer.innerHTML = '';
    
    userData.accounts.forEach(account => {
        const option = document.createElement('div');
        option.className = 'account-option';
        option.onclick = () => selectAccountForTransactions(account);
        option.innerHTML = `${account.account_name} - ${formatNumber(account.balance)} (#${account.account_number})`;
        
        if (selectedAccount && selectedAccount.id === account.id) {
            option.classList.add('selected');
        }
        
        optionsContainer.appendChild(option);
    });
}

function selectAccountForTransactions(account) {
    selectedAccount = account;
    
    const selectedDiv = document.querySelector('#transactionAccountSelect .dropdown-selected');
    if (selectedDiv) {
        selectedDiv.textContent = `${account.account_name} - ${formatNumber(account.balance)} (#${account.account_number})`;
    }
    
    document.querySelectorAll('.account-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelectorAll('.account-option').forEach(opt => {
        if (opt.textContent.includes(`#${account.account_number}`)) {
            opt.classList.add('selected');
        }
    });
    
    const dropdown = document.getElementById('transactionAccountSelect');
    const options = document.getElementById('transactionAccountOptions');
    if (dropdown && options) {
        dropdown.classList.remove('open');
        options.classList.remove('show');
    }
    
    loadTransactionHistory();
}

function loadTransactionHistory() {
    if (!selectedAccount) {
        displayEmptyTransactionHistory(_('select_account_transactions'));
        return;
    }

    sendNUIMessage('getTransactionHistory', {
        accountId: selectedAccount.id
    })
    .then(transactions => {
        displayTransactionHistory(transactions);
    })
    .catch(error => {
        displayEmptyTransactionHistory(_('transaction_loading_error'));
    });
}

function loadMainAccountTransactions() {
    if (!userData.accounts || userData.accounts.length === 0) {
        updateRecentTransactions([]);
        return;
    }

    const mainAccount = userData.accounts[0];
    
    sendNUIMessage('getTransactionHistory', {
        accountId: mainAccount.id
    })
    .then(transactions => {
        updateRecentTransactions(transactions ? transactions.slice(0, 5) : []);
    })
    .catch(error => {
        updateRecentTransactions([]);
    });
}

function displayTransactionHistory(transactions) {
    const historyDiv = document.getElementById('transactionHistory');
    if (!historyDiv) return;
    
    if (!transactions || transactions.length === 0) {
        displayEmptyTransactionHistory(_('no_transactions'));
        return;
    }

    historyDiv.innerHTML = '';
    
    transactions.forEach(transaction => {
        const transactionDiv = createTransactionElement(transaction, true);
        historyDiv.appendChild(transactionDiv);
    });
}

function displayEmptyTransactionHistory(message) {
    const historyDiv = document.getElementById('transactionHistory');
    if (historyDiv) {
        historyDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #a0aec0;">
                ${message}
            </div>
        `;
    }
}

function updateRecentTransactions(transactions) {
    const recentDiv = document.getElementById('recentTransactions');
    if (!recentDiv) return;
    
    if (!transactions || transactions.length === 0) {
        recentDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #a0aec0;">
                ${_('no_recent_transactions')}
            </div>
        `;
        return;
    }

    recentDiv.innerHTML = '';
    
    transactions.forEach(transaction => {
        const transactionDiv = createTransactionElement(transaction, false);
        recentDiv.appendChild(transactionDiv);
    });
}

function createTransactionElement(transaction, showFullDate = true) {
    const transactionDiv = document.createElement('div');
    transactionDiv.className = 'transaction-item';
    
    const typeData = getTransactionTypeData(transaction.transaction_type);
    const amount = transaction.transaction_type === 'transfer_out' || transaction.transaction_type === 'withdraw' 
        ? `-${formatNumber(transaction.amount)}` 
        : `+${formatNumber(transaction.amount)}`;
    
    const date = new Date(transaction.created_at);
    const dateString = showFullDate ? date.toLocaleString('cs-CZ') : date.toLocaleDateString('cs-CZ');
    
    let description = transaction.description || typeData.text;
    if (transaction.transaction_type === 'transfer_in' && transaction.from_account_number) {
        description += ` from #${transaction.from_account_number}`;
    } else if (transaction.transaction_type === 'transfer_out' && transaction.to_account_number) {
        description += ` to #${transaction.to_account_number}`;
    }

    const fullDateElement = showFullDate ? 
        `<p style="font-size: 11px; color: #68757d;">${dateString}</p>` : '';

    transactionDiv.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-icon ${transaction.transaction_type}">
                ${typeData.icon}
            </div>
            <div class="transaction-details">
                <h4>${typeData.text}</h4>
                <p>${description}${showFullDate ? '' : ' • ' + dateString}</p>
                ${fullDateElement}
            </div>
        </div>
        <div class="transaction-amount ${transaction.transaction_type === 'transfer_out' || transaction.transaction_type === 'withdraw' ? 'negative' : 'positive'}">
            ${amount}
        </div>
    `;
    
    return transactionDiv;
}

function getTransactionTypeData(type) {
    const types = {
        'deposit': { text: _('cash_deposit'), icon: '💰' },
        'withdraw': { text: _('cash_withdrawal'), icon: '💸' },
        'transfer_in': { text: _('incoming_transfer'), icon: '📥' },
        'transfer_out': { text: _('outgoing_transfer'), icon: '📤' }
    };
    
    return types[type] || { text: _('unknown_transaction'), icon: '❓' };
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 150);
    }
}

function clearModalInputs(inputs) {
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = '';
        }
    });
}

function clearModalInputsForModal(modalId) {
    const modalInputMap = {
        'depositModal': ['depositAmount', 'depositAccountSelect'],
        'withdrawModal': ['withdrawAmount', 'withdrawAccountSelect'],
        'transferModal': ['transferFromSelect', 'transferToAccount', 'transferAmount', 'transferDescription'],
        'createAccountModal': ['newAccountName'],
        'deleteAccountModal': []
    };
    
    const inputs = modalInputMap[modalId];
    if (inputs) {
        clearModalInputs(inputs);
    }
}

// Modal control functions
function showDepositModal() {
    showModal('depositModal');
}

function closeDepositModal() {
    hideModal('depositModal');
    clearModalInputs(['depositAmount', 'depositAccountSelect']);
}

function showWithdrawModal() {
    showModal('withdrawModal');
}

function closeWithdrawModal() {
    hideModal('withdrawModal');
    clearModalInputs(['withdrawAmount', 'withdrawAccountSelect']);
}

function showTransferModal() {
    showModal('transferModal');
}

function showTransferModalForAccount(accountId) {
    showModal('transferModal');
    setTimeout(() => {
        const transferFromSelect = document.getElementById('transferFromSelect');
        if (transferFromSelect) {
            transferFromSelect.value = accountId;
        }
    }, 50);
}

function closeTransferModal() {
    hideModal('transferModal');
    clearModalInputs(['transferFromSelect', 'transferToAccount', 'transferAmount', 'transferDescription']);
}

function showCreateAccountModal() {
    if (!userData || !userData.accounts) return;
    
    const accountCount = userData.accounts.length;
    const maxAccounts = userData.maxAccounts || 2;
    
    if (accountCount >= maxAccounts) {
        return;
    }
    
    showModal('createAccountModal');
}

function closeCreateAccountModal() {
    hideModal('createAccountModal');
    clearModalInputs(['newAccountName']);
}

function showDeleteAccountModal(accountId) {
    const account = userData.accounts ? userData.accounts.find(acc => acc.id === accountId) : null;
    if (!account) return;

    if (parseFloat(account.balance) > 0) {
        return;
    }

    if (userData.accounts.length <= 1) {
        return;
    }

    accountToDelete = account;
    
    const deleteAccountName = document.getElementById('deleteAccountName');
    const deleteAccountNumber = document.getElementById('deleteAccountNumber');
    
    if (deleteAccountName) deleteAccountName.textContent = account.account_name;
    if (deleteAccountNumber) deleteAccountNumber.textContent = `#${account.account_number}`;
    
    showModal('deleteAccountModal');
}

function closeDeleteAccountModal() {
    hideModal('deleteAccountModal');
    accountToDelete = null;
}

// Banking operations
function makeDeposit() {
    const accountId = document.getElementById('depositAccountSelect')?.value;
    const amount = document.getElementById('depositAmount')?.value;
    
    if (!validateTransaction(accountId, amount, _('select_account'))) return;

    const loadingBtn = document.querySelector('#depositModal .btn-primary');
    if (loadingBtn) {
        loadingBtn.disabled = true;
        loadingBtn.textContent = _('processing');
    }

    sendNUIMessage('deposit', {
        accountId: parseInt(accountId),
        amount: parseFloat(amount)
    })
    .then(data => {
        if (data && data.success) {
            closeDepositModal();
        }
    })
    .catch(error => {
    })
    .finally(() => {
        if (loadingBtn) {
            loadingBtn.disabled = false;
            loadingBtn.textContent = _('deposit_btn');
        }
    });
}

function makeWithdraw() {
    const accountId = document.getElementById('withdrawAccountSelect')?.value;
    const amount = document.getElementById('withdrawAmount')?.value;
    
    if (!validateTransaction(accountId, amount, _('select_account'))) return;

    const loadingBtn = document.querySelector('#withdrawModal .btn-primary');
    if (loadingBtn) {
        loadingBtn.disabled = true;
        loadingBtn.textContent = _('processing');
    }

    sendNUIMessage('withdraw', {
        accountId: parseInt(accountId),
        amount: parseFloat(amount)
    })
    .then(data => {
        if (data && data.success) {
            closeWithdrawModal();
        }
    })
    .catch(error => {
    })
    .finally(() => {
        if (loadingBtn) {
            loadingBtn.disabled = false;
            loadingBtn.textContent = _('withdraw_btn');
        }
    });
}

function makeTransfer() {
    const fromAccountId = document.getElementById('transferFromSelect')?.value;
    const toAccount = document.getElementById('transferToAccount')?.value;
    const amount = document.getElementById('transferAmount')?.value;
    const description = document.getElementById('transferDescription')?.value;
    
    if (!validateTransaction(fromAccountId, amount, _('select_source_account'))) return;
    
    if (!toAccount || toAccount.trim() === '') {
        return;
    }

    const accountNumberRegex = /^\d{8}$/;
    if (!accountNumberRegex.test(toAccount.trim())) {
        return;
    }

    const loadingBtn = document.querySelector('#transferModal .btn-primary');
    if (loadingBtn) {
        loadingBtn.disabled = true;
        loadingBtn.textContent = _('processing');
    }

    sendNUIMessage('transfer', {
        fromAccountId: parseInt(fromAccountId),
        toAccountNumber: toAccount.trim(),
        amount: parseFloat(amount),
        description: description?.trim() || ''
    })
    .then(data => {
        if (data && data.success) {
            closeTransferModal();
        }
    })
    .catch(error => {
    })
    .finally(() => {
        if (loadingBtn) {
            loadingBtn.disabled = false;
            loadingBtn.textContent = _('transfer');
        }
    });
}

function createAccount() {
    const accountName = document.getElementById('newAccountName')?.value;
    
    if (!accountName || accountName.trim().length < 3) {
        return;
    }

    const loadingBtn = document.querySelector('#createAccountModal .btn-primary');
    if (loadingBtn) {
        loadingBtn.disabled = true;
        loadingBtn.textContent = _('creating');
    }

    sendNUIMessage('createAccount', {
        accountName: accountName.trim()
    })
    .then(data => {
        if (data && data.success) {
            closeCreateAccountModal();
        }
    })
    .catch(error => {
    })
    .finally(() => {
        if (loadingBtn) {
            loadingBtn.disabled = false;
            loadingBtn.textContent = _('create');
        }
    });
}

function confirmDeleteAccount() {
    if (!accountToDelete) return;

    const loadingBtn = document.querySelector('#deleteAccountModal .btn-danger');
    if (loadingBtn) {
        loadingBtn.disabled = true;
        loadingBtn.textContent = _('deleting');
    }

    sendNUIMessage('deleteAccount', {
        accountId: accountToDelete.id
    })
    .then(data => {
        if (data && data.success) {
            closeDeleteAccountModal();
            
            if (selectedAccount && selectedAccount.id === accountToDelete.id) {
                selectedAccount = null;
                resetTransactionAccountSelect();
                displayEmptyTransactionHistory(_('select_account_transactions'));
            }
        }
    })
    .catch(error => {
    })
    .finally(() => {
        if (loadingBtn) {
            loadingBtn.disabled = false;
            loadingBtn.textContent = _('delete');
        }
    });
}

function generateBalanceHistoryFromTransactions(transactions, currentBalance) {
    const history = [];
    const today = new Date();
    
    try {
        const sortedTransactions = transactions.sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
        );
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);
            
            let balanceAtEndOfDay = parseFloat(currentBalance);
            
            const transactionsAfterDay = sortedTransactions.filter(transaction => {
                const transactionDate = new Date(transaction.created_at);
                return transactionDate > dayEnd;
            });
            
            transactionsAfterDay.forEach(transaction => {
                const amount = parseFloat(transaction.amount || 0);
                if (transaction.transaction_type === 'deposit' || transaction.transaction_type === 'transfer_in') {
                    balanceAtEndOfDay -= amount;
                } else if (transaction.transaction_type === 'withdraw' || transaction.transaction_type === 'transfer_out') {
                    balanceAtEndOfDay += amount;
                }
            });
            
            history.push({
                date: date.toISOString(),
                balance: balanceAtEndOfDay
            });
        }
        
        return history;
        
    } catch (error) {
        const fallbackHistory = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            fallbackHistory.push({
                date: date.toISOString(),
                balance: parseFloat(currentBalance)
            });
        }
        return fallbackHistory;
    }
}

// Utility functions
function validateTransaction(accountId, amount, accountError) {
    if (!accountId) {
        return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
        return false;
    }

    return true;
}

function formatNumber(num) {
    const number = parseFloat(num) || 0;
    return new Intl.NumberFormat('cs-CZ').format(number);
}

function getParentResourceName() {
    return typeof window.GetParentResourceName !== 'undefined' 
        ? window.GetParentResourceName() 
        : 'banking_system';
}

function sendNUIMessage(action, data) {
    return new Promise((resolve, reject) => {
        try {
            fetch(`https://${getParentResourceName()}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                resolve(result);
            })
            .catch(error => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function createBalanceChart() {
    const ctx = document.getElementById('balanceChart');
    if (!ctx) return;
    
    if (isCreatingChart) return;
    isCreatingChart = true;

    if (balanceChart) {
        balanceChart.destroy();
        balanceChart = null;
    }

    if (!userData.accounts || userData.accounts.length === 0) {
        isCreatingChart = false;
        return;
    }

    const mainAccount = userData.accounts[0];

    sendNUIMessage('getTransactionHistory', {
        accountId: mainAccount.id
    })
    .then(transactions => {
        if (!transactions || transactions.length === 0) {
            createChartWithCurrentBalance(ctx, mainAccount.balance);
            return;
        }
        
        const balanceHistory = generateBalanceHistoryFromTransactions(transactions, mainAccount.balance);
        createChartWithHistoricalData(ctx, balanceHistory);
    })
    .catch(error => {
        createChartWithCurrentBalance(ctx, mainAccount.balance);
    })
    .finally(() => {
        isCreatingChart = false;
    });
}

function createChartWithHistoricalData(ctx, balanceHistory) {
    const labels = [];
    const data = [];

    balanceHistory.forEach(record => {
        const date = new Date(record.date);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        labels.push(`${day}.${month}`);
        data.push(parseFloat(record.balance || 0));
    });

    balanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: _('balance_chart'),
                data: data,
                borderColor: '#4299e1',
                backgroundColor: 'rgba(66, 153, 225, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4299e1',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: '#63b3ed',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3
            }]
        },
        options: getChartOptions()
    });
}

function createChartWithCurrentBalance(ctx, currentBalance) {
    const labels = [];
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        labels.push(`${day}.${month}`);
        data.push(parseFloat(currentBalance || 0));
    }

    balanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: _('balance_chart'),
                data: data,
                borderColor: '#4299e1',
                backgroundColor: 'rgba(66, 153, 225, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4299e1',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: '#63b3ed',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3
            }]
        },
        options: getChartOptions()
    });
}

function getChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(26, 32, 44, 0.9)',
                titleColor: '#e2e8f0',
                bodyColor: '#e2e8f0',
                borderColor: '#4a5568',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        return `${_('balance_chart')}: $ ${formatNumber(context.parsed.y)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(74, 85, 104, 0.3)',
                    drawBorder: false
                },
                ticks: {
                    color: '#a0aec0',
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(74, 85, 104, 0.3)',
                    drawBorder: false
                },
                ticks: {
                    color: '#a0aec0',
                    font: {
                        size: 11
                    },
                    callback: function(value) {
                        return '$ ' + formatNumber(value);
                    }
                }
            }
        },
        elements: {
            point: {
                hoverBorderWidth: 3
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    };
}