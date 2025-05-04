// Google Sheets API URL
// Nota: questo URL deve essere l'URL del Web App pubblicato, non l'URL dell'editor di script
// Esempio: https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbwcBUCV3BNbNYzMuRLjS79YACJCu6yqiHwLDmtM59mrbf2Q0-Ftp_DIX7b4csn9IyrbCg/exec';

// User credentials
const users = [
    { username: 'FreakyFaw', password: 'Almeno1Lettera' },
    { username: 'FreakyVity', password: 'Sborratore' },
    { username: 'enpiesie', password: 'Nigger' }
];

// DOM Elements
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const currentUserSpan = document.getElementById('current-user');
const logoutBtn = document.getElementById('logout-btn');
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');

// Business section elements
const businessNotes = document.getElementById('business-notes');
const saveNotesBtn = document.getElementById('save-notes');
const newGoalInput = document.getElementById('new-goal');
const addGoalBtn = document.getElementById('add-goal');
const goalsList = document.getElementById('goals-list');
const salesValue = document.getElementById('sales-value');
const revenueValue = document.getElementById('revenue-value');
const inventoryValue = document.getElementById('inventory-value');

// Marketing News elements
const newsTitle = document.getElementById('news-title');
const newsContent = document.getElementById('news-content');
const postNewsBtn = document.getElementById('post-news');
const newsList = document.getElementById('news-list');

// Restock Reporting elements
const itemName = document.getElementById('item-name');
const itemQuantity = document.getElementById('item-quantity');
const restockNotes = document.getElementById('restock-notes');
const submitRestockBtn = document.getElementById('submit-restock');
const restockList = document.getElementById('restock-list');

// Current user data
let currentUser = null;
let userData = {};
let newsData = [];
let restockData = [];

// Initialize application
async function init() {
    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.innerHTML = '<div class="spinner"></div><p>Loading data...</p>';
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '0';
    loadingIndicator.style.left = '0';
    loadingIndicator.style.width = '100%';
    loadingIndicator.style.height = '100%';
    loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    loadingIndicator.style.display = 'flex';
    loadingIndicator.style.flexDirection = 'column';
    loadingIndicator.style.justifyContent = 'center';
    loadingIndicator.style.alignItems = 'center';
    loadingIndicator.style.color = 'white';
    loadingIndicator.style.zIndex = '9999';
    
    const spinner = loadingIndicator.querySelector('.spinner');
    spinner.style.width = '50px';
    spinner.style.height = '50px';
    spinner.style.border = '5px solid var(--primary-light)';
    spinner.style.borderTopColor = 'var(--primary-dark)';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';
    
    // Add animation style
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(loadingIndicator);
    
    // Load data from Google Sheets
    try {
        await loadData();
    } catch (error) {
        console.error('Error initializing application:', error);
    } finally {
        // Remove loading indicator
        document.body.removeChild(loadingIndicator);
    }
    
    // Add event listeners
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    saveNotesBtn.addEventListener('click', saveBusinessNotes);
    addGoalBtn.addEventListener('click', addBusinessGoal);
    postNewsBtn.addEventListener('click', postMarketingNews);
    submitRestockBtn.addEventListener('click', submitRestockReport);
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        showDashboard();
    }
}

// Load data from Google Sheets or initialize empty data
async function loadData() {
    try {
        // Load user data
        const userDataResponse = await fetch(`${SHEETS_API_URL}?operation=read&sheet=userData`);
        const userDataResult = await userDataResponse.json();
        
        if (userDataResult.status === 'success') {
            // Convert array to object with username as key
            userData = {};
            userDataResult.data.forEach(user => {
                userData[user.username] = {
                    notes: user.notes,
                    goals: JSON.parse(user.goals || '[]'),
                    stats: {
                        sales: user.sales,
                        revenue: user.revenue,
                        inventory: user.inventory
                    }
                };
            });
        } else {
            // Fallback to localStorage if API fails
            const savedUserData = localStorage.getItem('userData');
            if (savedUserData) {
                userData = JSON.parse(savedUserData);
            }
        }
        
        // Load news data
        const newsDataResponse = await fetch(`${SHEETS_API_URL}?operation=read&sheet=newsData`);
        const newsDataResult = await newsDataResponse.json();
        
        if (newsDataResult.status === 'success') {
            newsData = newsDataResult.data;
        } else {
            // Fallback to localStorage if API fails
            const savedNewsData = localStorage.getItem('newsData');
            if (savedNewsData) {
                newsData = JSON.parse(savedNewsData);
            }
        }
        
        // Load restock data
        const restockDataResponse = await fetch(`${SHEETS_API_URL}?operation=read&sheet=restockData`);
        const restockDataResult = await restockDataResponse.json();
        
        if (restockDataResult.status === 'success') {
            restockData = restockDataResult.data;
        } else {
            // Fallback to localStorage if API fails
            const savedRestockData = localStorage.getItem('restockData');
            if (savedRestockData) {
                restockData = JSON.parse(savedRestockData);
            }
        }
        
        // Initialize user data if not exists
        users.forEach(user => {
            if (!userData[user.username]) {
                userData[user.username] = {
                    notes: '',
                    goals: [],
                    stats: {
                        sales: 0,
                        revenue: 0,
                        inventory: 0
                    }
                };
            }
        });
        
        // Save initialized data
        saveData();
    } catch (error) {
        console.error('Error loading data:', error);
        // Initialize empty data or load from localStorage as fallback
        userData = {};
        newsData = [];
        restockData = [];
        
        // Try to load from localStorage as fallback
        const savedUserData = localStorage.getItem('userData');
        const savedNewsData = localStorage.getItem('newsData');
        const savedRestockData = localStorage.getItem('restockData');
        
        if (savedUserData) userData = JSON.parse(savedUserData);
        if (savedNewsData) newsData = JSON.parse(savedNewsData);
        if (savedRestockData) restockData = JSON.parse(savedRestockData);
        
        // Initialize user data if not exists
        users.forEach(user => {
            if (!userData[user.username]) {
                userData[user.username] = {
                    notes: '',
                    goals: [],
                    stats: {
                        sales: 0,
                        revenue: 0,
                        inventory: 0
                    }
                };
            }
        });
        
        saveData();
    }
}

// Save data to Google Sheets and localStorage as backup
async function saveData() {
    try {
        // Save user data to Google Sheets
        await fetch(`${SHEETS_API_URL}?operation=write&sheet=userData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `data=${encodeURIComponent(JSON.stringify(userData))}`
        });
        
        // Save news data to Google Sheets
        await fetch(`${SHEETS_API_URL}?operation=write&sheet=newsData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `data=${encodeURIComponent(JSON.stringify(newsData))}`
        });
        
        // Save restock data to Google Sheets
        await fetch(`${SHEETS_API_URL}?operation=write&sheet=restockData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `data=${encodeURIComponent(JSON.stringify(restockData))}`
        });
        
        // Also save to localStorage as backup
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('newsData', JSON.stringify(newsData));
        localStorage.setItem('restockData', JSON.stringify(restockData));
    } catch (error) {
        console.error('Error saving data to Google Sheets:', error);
        // Save to localStorage as fallback
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('newsData', JSON.stringify(newsData));
        localStorage.setItem('restockData', JSON.stringify(restockData));
    }
}

// Handle login
function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = username;
        localStorage.setItem('currentUser', currentUser);
        showDashboard();
        loginError.textContent = '';
    } else {
        loginError.textContent = 'Invalid username or password';
    }
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLogin();
}

// Show dashboard
function showDashboard() {
    loginContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    currentUserSpan.textContent = `Welcome, ${currentUser}`;
    
    // Load user-specific data
    loadUserData();
    
    // Load shared data
    loadNewsData();
    loadRestockData();
    
    // Show default section (My Business)
    showSection('my-business');
}

// Show login
function showLogin() {
    dashboardContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    usernameInput.value = '';
    passwordInput.value = '';
}

// Handle navigation
function handleNavigation(event) {
    event.preventDefault();
    const sectionId = event.target.getAttribute('data-section');
    
    // Update active link
    navLinks.forEach(link => {
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    showSection(sectionId);
}

// Show specific section
function showSection(sectionId) {
    contentSections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
}

// Load user-specific data
function loadUserData() {
    const user = userData[currentUser];
    
    if (user) {
        // Load business notes
        businessNotes.value = user.notes;
        
        // Load business goals
        renderGoals(user.goals);
        
        // Load business stats
        salesValue.textContent = user.stats.sales;
        revenueValue.textContent = `$${user.stats.revenue}`;
        inventoryValue.textContent = `${user.stats.inventory} items`;
    }
}

// Save business notes
function saveBusinessNotes() {
    if (!currentUser) return;
    
    userData[currentUser].notes = businessNotes.value;
    saveData();
    
    // Show success message
    alert('Notes saved successfully!');
}

// Add business goal
function addBusinessGoal() {
    if (!currentUser) return;
    
    const goalText = newGoalInput.value.trim();
    if (goalText === '') return;
    
    userData[currentUser].goals.push({
        id: Date.now(),
        text: goalText,
        completed: false
    });
    
    saveData();
    newGoalInput.value = '';
    renderGoals(userData[currentUser].goals);
}

// Render business goals
function renderGoals(goals) {
    goalsList.innerHTML = '';
    
    goals.forEach(goal => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="${goal.completed ? 'completed' : ''}">${goal.text}</span>
            <div>
                <button class="toggle-goal" data-id="${goal.id}">
                    ${goal.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="delete-goal" data-id="${goal.id}">Delete</button>
            </div>
        `;
        
        goalsList.appendChild(li);
    });
    
    // Add event listeners to goal buttons
    document.querySelectorAll('.toggle-goal').forEach(btn => {
        btn.addEventListener('click', toggleGoal);
    });
    
    document.querySelectorAll('.delete-goal').forEach(btn => {
        btn.addEventListener('click', deleteGoal);
    });
}

// Toggle goal completion
function toggleGoal(event) {
    if (!currentUser) return;
    
    const goalId = parseInt(event.target.getAttribute('data-id'));
    const goals = userData[currentUser].goals;
    
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    if (goalIndex !== -1) {
        goals[goalIndex].completed = !goals[goalIndex].completed;
        saveData();
        renderGoals(goals);
    }
}

// Delete goal
function deleteGoal(event) {
    if (!currentUser) return;
    
    const goalId = parseInt(event.target.getAttribute('data-id'));
    const goals = userData[currentUser].goals;
    
    userData[currentUser].goals = goals.filter(goal => goal.id !== goalId);
    saveData();
    renderGoals(userData[currentUser].goals);
}

// Post marketing news
function postMarketingNews() {
    if (!currentUser) return;
    
    const title = newsTitle.value.trim();
    const content = newsContent.value.trim();
    
    if (title === '' || content === '') {
        alert('Please enter both title and content for your news post.');
        return;
    }
    
    const newsItem = {
        id: Date.now(),
        title: title,
        content: content,
        author: currentUser,
        timestamp: new Date().toISOString()
    };
    
    newsData.unshift(newsItem); // Add to beginning of array
    saveData();
    
    // Clear form
    newsTitle.value = '';
    newsContent.value = '';
    
    // Refresh news list
    loadNewsData();
}

// Load news data
function loadNewsData() {
    newsList.innerHTML = '';
    
    newsData.forEach(news => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        
        const date = new Date(news.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        newsItem.innerHTML = `
            <h4>${news.title}</h4>
            <p>${news.content}</p>
            <div class="news-meta">
                <span>Posted by: ${news.author}</span>
                <span>${formattedDate}</span>
            </div>
        `;
        
        newsList.appendChild(newsItem);
    });
}

// Submit restock report
function submitRestockReport() {
    if (!currentUser) return;
    
    const name = itemName.value.trim();
    const quantity = parseInt(itemQuantity.value);
    const notes = restockNotes.value.trim();
    
    if (name === '' || isNaN(quantity) || quantity <= 0) {
        alert('Please enter a valid item name and quantity.');
        return;
    }
    
    const restockItem = {
        id: Date.now(),
        itemName: name,
        quantity: quantity,
        notes: notes,
        reporter: currentUser,
        timestamp: new Date().toISOString()
    };
    
    restockData.unshift(restockItem); // Add to beginning of array
    saveData();
    
    // Clear form
    itemName.value = '';
    itemQuantity.value = '';
    restockNotes.value = '';
    
    // Refresh restock list
    loadRestockData();
}

// Load restock data
function loadRestockData() {
    restockList.innerHTML = '';
    
    restockData.forEach(restock => {
        const restockItem = document.createElement('div');
        restockItem.className = 'restock-item';
        
        const date = new Date(restock.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        restockItem.innerHTML = `
            <h4>${restock.itemName} - ${restock.quantity} units</h4>
            ${restock.notes ? `<p>${restock.notes}</p>` : ''}
            <div class="restock-meta">
                <span>Reported by: ${restock.reporter}</span>
                <span>${formattedDate}</span>
            </div>
        `;
        
        restockList.appendChild(restockItem);
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
