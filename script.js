// ResiFund Website JavaScript
'use strict';

class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme();
        this.bindEvents();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            themeIcon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    bindEvents() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }
}

class ScrollAnimationManager {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        this.createObserver();
        this.observeElements();
    }

    createObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                } else {
                    entry.target.classList.remove('animate');
                }
            });
        }, this.observerOptions);
    }

    observeElements() {
        const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .slide-in-left, .slide-in-right');
        animatedElements.forEach(el => this.observer.observe(el));
        
        // Observe impact section for number animation
        const impactSection = document.querySelector('#impact');
        if (impactSection) {
            this.impactObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateImpactNumbers();
                    }
                });
            }, { threshold: 0.3 });
            this.impactObserver.observe(impactSection);
        }
    }
    
    animateImpactNumbers() {
        const impactNumbers = document.querySelectorAll('.impact-number');
        impactNumbers.forEach(numberElement => {
            const target = parseInt(numberElement.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                numberElement.textContent = Math.floor(current).toLocaleString();
            }, 16);
        });
    }
}

class FormValidator {
    constructor() {
        this.patterns = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[\+]?[1-9][\d]{0,2}[\s\-]?[\(]?[\d]{1,3}[\)]?[\s\-]?[\d]{3,4}[\s\-]?[\d]{3,4}$/,
            password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
        };
    }

    validateField(field, type) {
        const value = field.value.trim();
        const isValid = this.patterns[type] ? this.patterns[type].test(value) : value.length > 0;
        
        this.updateFieldStatus(field, isValid);
        return isValid;
    }

    updateFieldStatus(field, isValid) {
        const errorElement = field.parentElement.querySelector('.error-message');
        
        if (isValid) {
            field.classList.remove('error');
            field.classList.add('valid');
            if (errorElement) errorElement.style.display = 'none';
        } else {
            field.classList.remove('valid');
            field.classList.add('error');
            if (errorElement) errorElement.style.display = 'block';
        }
    }

    validateForm(form) {
        const fields = form.querySelectorAll('input[required], textarea[required]');
        let isFormValid = true;

        fields.forEach(field => {
            const type = field.type === 'email' ? 'email' : 
                        field.type === 'tel' ? 'phone' :
                        field.type === 'password' ? 'password' : 'text';
            
            if (!this.validateField(field, type)) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }
}

class ContactFormHandler {
    constructor() {
        this.validator = new FormValidator();
        this.init();
    }

    init() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            this.bindFormEvents(contactForm);
        }
    }

    bindFormEvents(form) {
        // Real-time validation
        const fields = form.querySelectorAll('input, textarea');
        fields.forEach(field => {
            field.addEventListener('blur', () => {
                const type = field.type === 'email' ? 'email' : 
                            field.type === 'tel' ? 'phone' : 'text';
                this.validator.validateField(field, type);
            });
        });

        // Form submission
        form.addEventListener('submit', (e) => this.handleSubmit(e, form));
    }

    async handleSubmit(e, form) {
        e.preventDefault();
        
        if (!this.validator.validateForm(form)) {
            showNotification('Please fill in all required fields correctly.', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            form.reset();
            
            // Remove validation classes
            const fields = form.querySelectorAll('input, textarea');
            fields.forEach(field => {
                field.classList.remove('valid', 'error');
            });
            
        } catch (error) {
            showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}

class InvestmentCalculator {
    constructor() {
        this.init();
    }

    init() {
        const calculatorForm = document.getElementById('investmentCalculator');
        if (calculatorForm) {
            this.bindCalculatorEvents(calculatorForm);
        }
    }

    bindCalculatorEvents(form) {
        const inputs = form.querySelectorAll('input[type="number"], input[type="range"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculateReturns(form));
        });
    }

    calculateReturns(form) {
        const amount = parseFloat(form.querySelector('#investmentAmount').value) || 0;
        const duration = parseInt(form.querySelector('#investmentDuration').value) || 1;
        const riskLevel = form.querySelector('#riskLevel').value;
        
        const rates = {
            low: 0.06,
            medium: 0.08,
            high: 0.12
        };
        
        const annualRate = rates[riskLevel] || rates.medium;
        const monthlyRate = annualRate / 12;
        const totalMonths = duration * 12;
        
        // Compound interest calculation
        const futureValue = amount * Math.pow(1 + monthlyRate, totalMonths);
        const totalReturns = futureValue - amount;
        
        this.displayResults({
            investment: amount,
            duration: duration,
            futureValue: futureValue,
            totalReturns: totalReturns,
            annualRate: annualRate
        });
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('calculatorResults');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = `
            <div class="calculation-results">
                <h4>Investment Projection</h4>
                <div class="result-item">
                    <span>Initial Investment:</span>
                    <span class="amount">$${results.investment.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span>Investment Period:</span>
                    <span>${results.duration} years</span>
                </div>
                <div class="result-item">
                    <span>Expected Annual Return:</span>
                    <span>${(results.annualRate * 100).toFixed(1)}%</span>
                </div>
                <div class="result-item highlight">
                    <span>Future Value:</span>
                    <span class="amount">$${results.futureValue.toLocaleString()}</span>
                </div>
                <div class="result-item highlight">
                    <span>Total Returns:</span>
                    <span class="amount profit">+$${results.totalReturns.toLocaleString()}</span>
                </div>
            </div>
        `;
        
        resultsContainer.style.display = 'block';
    }
}

class PropertySearchHandler {
    constructor() {
        this.properties = [];
        this.filteredProperties = [];
        this.init();
    }

    init() {
        this.loadSampleProperties();
        this.bindSearchEvents();
        this.displayProperties();
    }

    loadSampleProperties() {
        this.properties = [
            {
                id: 1,
                title: "Modern Downtown Apartment Complex",
                location: "Downtown District",
                type: "Residential",
                price: 2500000,
                expectedReturn: 8.5,
                riskLevel: "Medium",
                image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
                description: "Prime location apartment complex with 24 units"
            },
            {
                id: 2,
                title: "Commercial Office Building",
                location: "Business District",
                type: "Commercial",
                price: 5000000,
                expectedReturn: 12.0,
                riskLevel: "High",
                image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
                description: "Modern office building with long-term tenants"
            },
            {
                id: 3,
                title: "Suburban Family Homes",
                location: "Greenwood Suburbs",
                type: "Residential",
                price: 1800000,
                expectedReturn: 6.5,
                riskLevel: "Low",
                image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400",
                description: "Collection of 8 family homes in growing suburb"
            },
            {
                id: 4,
                title: "Retail Shopping Center",
                location: "Main Street",
                type: "Commercial",
                price: 3200000,
                expectedReturn: 9.2,
                riskLevel: "Medium",
                image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
                description: "Established shopping center with diverse tenants"
            }
        ];
        this.filteredProperties = [...this.properties];
    }

    bindSearchEvents() {
        const searchInput = document.getElementById('propertySearch');
        const typeFilter = document.getElementById('propertyType');
        const locationFilter = document.getElementById('propertyLocation');
        const priceFilter = document.getElementById('priceRange');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterProperties());
        }
        
        [typeFilter, locationFilter, priceFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.filterProperties());
            }
        });
    }

    filterProperties() {
        const searchTerm = document.getElementById('propertySearch')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('propertyType')?.value || 'all';
        const locationFilter = document.getElementById('propertyLocation')?.value || 'all';
        const priceFilter = document.getElementById('priceRange')?.value || 'all';
        
        this.filteredProperties = this.properties.filter(property => {
            const matchesSearch = property.title.toLowerCase().includes(searchTerm) ||
                                property.description.toLowerCase().includes(searchTerm);
            
            const matchesType = typeFilter === 'all' || property.type.toLowerCase() === typeFilter;
            
            const matchesLocation = locationFilter === 'all' || 
                                  property.location.toLowerCase().includes(locationFilter.toLowerCase());
            
            let matchesPrice = true;
            if (priceFilter !== 'all') {
                const [min, max] = priceFilter.split('-').map(Number);
                matchesPrice = property.price >= min && (max ? property.price <= max : true);
            }
            
            return matchesSearch && matchesType && matchesLocation && matchesPrice;
        });
        
        this.displayProperties();
    }

    displayProperties() {
        const container = document.getElementById('propertyResults');
        if (!container) return;
        
        if (this.filteredProperties.length === 0) {
            container.innerHTML = '<p class="no-results">No properties found matching your criteria.</p>';
            return;
        }
        
        container.innerHTML = this.filteredProperties.map(property => `
            <div class="property-card" data-id="${property.id}">
                <div class="property-image">
                    <img src="${property.image}" alt="${property.title}" loading="lazy">
                    <div class="property-badge ${property.riskLevel.toLowerCase()}">${property.riskLevel} Risk</div>
                </div>
                <div class="property-content">
                    <h3>${property.title}</h3>
                    <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${property.location}</p>
                    <p class="property-description">${property.description}</p>
                    <div class="property-stats">
                        <div class="stat">
                            <span class="label">Investment:</span>
                            <span class="value">$${property.price.toLocaleString()}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Expected Return:</span>
                            <span class="value return">${property.expectedReturn}%</span>
                        </div>
                        <div class="stat">
                            <span class="label">Type:</span>
                            <span class="value">${property.type}</span>
                        </div>
                    </div>
                    <div class="property-actions">
                        <button class="btn btn-primary" onclick="viewPropertyDetails(${property.id})">View Details</button>
                        <button class="btn btn-outline" onclick="addToWatchlist(${property.id})">Add to Watchlist</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

class DashboardManager {
    constructor() {
        this.portfolioData = {
            totalInvestment: 0,
            currentValue: 0,
            totalReturns: 0,
            activeInvestments: 0,
            monthlyIncome: 0
        };
        this.init();
    }

    init() {
        this.loadPortfolioData();
    }

    loadPortfolioData() {
        // Simulate loading user portfolio data
        this.portfolioData = {
            totalInvestment: 150000,
            currentValue: 168500,
            totalReturns: 18500,
            activeInvestments: 3,
            monthlyIncome: 2100
        };
    }

    updateDashboard() {
        this.updatePortfolioStats();
        this.updateInvestmentChart();
        this.updateRecentActivity();
    }

    updatePortfolioStats() {
        const stats = {
            'total-investment': `$${this.portfolioData.totalInvestment.toLocaleString()}`,
            'current-value': `$${this.portfolioData.currentValue.toLocaleString()}`,
            'total-returns': `$${this.portfolioData.totalReturns.toLocaleString()}`,
            'active-investments': this.portfolioData.activeInvestments,
            'monthly-income': `$${this.portfolioData.monthlyIncome.toLocaleString()}`
        };

        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Update return percentage
        const returnPercentage = ((this.portfolioData.totalReturns / this.portfolioData.totalInvestment) * 100).toFixed(1);
        const returnElement = document.getElementById('return-percentage');
        if (returnElement) {
            returnElement.textContent = `+${returnPercentage}%`;
            returnElement.className = returnPercentage > 0 ? 'positive' : 'negative';
        }
    }

    updateInvestmentChart() {
        // Placeholder for chart implementation
        const chartContainer = document.getElementById('investment-chart');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="chart-placeholder">
                    <p>Investment Performance Chart</p>
                    <div class="chart-bars">
                        <div class="bar" style="height: 60%"></div>
                        <div class="bar" style="height: 75%"></div>
                        <div class="bar" style="height: 85%"></div>
                        <div class="bar" style="height: 90%"></div>
                        <div class="bar" style="height: 95%"></div>
                        <div class="bar" style="height: 100%"></div>
                    </div>
                </div>
            `;
        }
    }

    updateRecentActivity() {
        const activities = [
            { date: '2024-01-15', action: 'Investment', property: 'Downtown Apartment Complex', amount: '+$2,100' },
            { date: '2024-01-10', action: 'Dividend', property: 'Commercial Office Building', amount: '+$1,500' },
            { date: '2024-01-05', action: 'Investment', property: 'Retail Shopping Center', amount: '+$800' }
        ];

        const activityContainer = document.getElementById('recent-activity');
        if (activityContainer) {
            activityContainer.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-info">
                        <span class="activity-action">${activity.action}</span>
                        <span class="activity-property">${activity.property}</span>
                        <span class="activity-date">${activity.date}</span>
                    </div>
                    <span class="activity-amount positive">${activity.amount}</span>
                </div>
            `).join('');
        }
    }
}

// Global instances
let themeManager;
let scrollAnimationManager;
let contactFormHandler;
let investmentCalculator;
let propertySearchHandler;
let dashboardManager;

// Authentication state
let isLoggedIn = false;
let currentUser = null;

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function switchModal(fromModalId, toModalId) {
    closeModal(fromModalId);
    setTimeout(() => openModal(toModalId), 100);
}

// Authentication functions
function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('#loginEmail').value;
    const password = form.querySelector('#loginPassword').value;
    
    // Simulate login validation
    if (email && password) {
        isLoggedIn = true;
        currentUser = { email: email, name: email.split('@')[0] };
        
        closeModal('loginModal');
        showNotification('Login successful!', 'success');
        updateAuthUI();
        
        // If user was trying to access dashboard, show it now
        if (window.location.hash === '#dashboard') {
            showSection('dashboard');
        }
    } else {
        showNotification('Please enter valid credentials.', 'error');
    }
}

function handleSignup(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('#signupName').value;
    const email = form.querySelector('#signupEmail').value;
    const password = form.querySelector('#signupPassword').value;
    
    // Simulate signup validation
    if (name && email && password) {
        isLoggedIn = true;
        currentUser = { email: email, name: name };
        
        closeModal('signupModal');
        showNotification('Account created successfully!', 'success');
        updateAuthUI();
    } else {
        showNotification('Please fill in all fields.', 'error');
    }
}

function handleLogout() {
    isLoggedIn = false;
    currentUser = null;
    updateAuthUI();
    showNotification('Logged out successfully.', 'success');
    
    // If user is on dashboard, redirect to home
    if (document.querySelector('.section.active').id === 'dashboard') {
        showSection('home');
    }
}

function updateAuthUI() {
    const loginBtn = document.querySelector('a[onclick="openModal(\'loginModal\')"]');
    const signupBtn = document.querySelector('a[onclick="openModal(\'signupModal\')"]');
    const dashboardLink = document.querySelector('a[onclick="showSection(\'dashboard\')"]');
    const browseProjectsLink = document.querySelector('a[onclick="showSection(\'browse-projects\')"]');
    
    // Browse Projects should always be visible
    if (browseProjectsLink) browseProjectsLink.style.display = 'block';
    
    if (isLoggedIn) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) {
            signupBtn.textContent = 'Logout';
            signupBtn.onclick = handleLogout;
        }
        if (dashboardLink) dashboardLink.style.display = 'block';
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (signupBtn) {
            signupBtn.textContent = 'Sign Up';
            signupBtn.onclick = () => openModal('signupModal');
        }
        if (dashboardLink) dashboardLink.style.display = 'none';
    }
}

// Navigation functions
function showSection(sectionId) {
    // Handle navigation to separate pages
    if (sectionId === 'browse-projects') {
        window.location.href = 'browse-projects.html';
        return;
    }
    
    if (sectionId === 'dashboard') {
        if (!isLoggedIn) {
            openModal('loginModal');
            showNotification('Please login to access your dashboard.', 'info');
            return;
        }
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update URL hash
    window.location.hash = '#' + sectionId;
}

function updateDashboard() {
    if (dashboardManager) {
        dashboardManager.updateDashboard();
    }
}

// Logout function
function logout() {
    isLoggedIn = false;
    localStorage.setItem('isLoggedIn', 'false');
    updateAuthUI();
    window.location.href = 'index.html';
    showNotification('You have been logged out successfully.', 'success');
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function viewPropertyDetails(propertyId) {
    showNotification(`Viewing details for property ${propertyId}`, 'info');
    // Implementation for property details modal
}

function addToWatchlist(propertyId) {
    if (!isLoggedIn) {
        openModal('loginModal');
        showNotification('Please login to add properties to your watchlist.', 'info');
        return;
    }
    showNotification(`Property ${propertyId} added to watchlist!`, 'success');
}

// Performance optimization
// Service worker registration disabled - sw.js file not present
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/sw.js')
//             .then(registration => console.log('SW registered'))
//             .catch(error => console.log('SW registration failed'));
//     });
// }

// Lazy loading for images (if any are added later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize managers
    themeManager = new ThemeManager();
    scrollAnimationManager = new ScrollAnimationManager();
    contactFormHandler = new ContactFormHandler();
    investmentCalculator = new InvestmentCalculator();
    propertySearchHandler = new PropertySearchHandler();
    dashboardManager = new DashboardManager();
    
    // Initialize auth UI
    updateAuthUI();
    
    // Handle initial hash
    const hash = window.location.hash.substring(1);
    if (hash) {
        showSection(hash);
    } else {
        showSection('home');
    }
    
    // Handle hash changes
    window.addEventListener('hashchange', () => {
        const newHash = window.location.hash.substring(1);
        if (newHash) {
            showSection(newHash);
        }
    });
    
    // Prevent default anchor behavior for navigation links
    document.addEventListener('click', (e) => {
        if (e.target.matches('a[href="#"]')) {
            e.preventDefault();
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Handle escape key for modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="flex"]');
            if (openModal) {
                openModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });
});