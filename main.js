// main.js - Core functionality for StyleHub website

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initDropdowns();
    setupCartFunctionality();
    setupSearchFunctionality();
});

// Mobile menu toggle functionality
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainMenu = document.querySelector('.main-menu');
    
    if (mobileMenuToggle && mainMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mainMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.main-menu') && !event.target.closest('.mobile-menu-toggle')) {
                if (mainMenu.classList.contains('active')) {
                    mainMenu.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                }
            }
        });
    }
}

// Initialize dropdown menus
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        // For mobile: touch events
        dropdown.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                if (!e.target.closest('.dropdown-content')) {
                    e.preventDefault();
                    this.classList.toggle('active');
                }
            }
        });
        
        // For desktop: hover events
        dropdown.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) {
                this.classList.add('active');
            }
        });
        
        dropdown.addEventListener('mouseleave', function() {
            if (window.innerWidth > 768) {
                this.classList.remove('active');
            }
        });
    });
}

// Shopping cart functionality
function setupCartFunctionality() {
    // Load cart from localStorage
    let cart = JSON.parse(localStorage.getItem('stylehub_cart')) || [];
    updateCartCount(cart.length);
    
    // Add click event for all "Add to Cart" buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
            e.preventDefault();
            const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
            const productCard = button.closest('.product-card');
            
            if (productCard) {
                const productId = productCard.dataset.id;
                const productName = productCard.querySelector('.product-title').textContent;
                const productPrice = parseFloat(productCard.querySelector('.product-price').textContent.replace('$', ''));
                const productImage = productCard.querySelector('.product-img').src;
                
                addToCart({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
            }
        }
    });
    
    // Function to add item to cart
    function addToCart(product) {
        // Check if product already exists in cart
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push(product);
        }
        
        // Save cart to localStorage
        localStorage.setItem('stylehub_cart', JSON.stringify(cart));
        updateCartCount(cart.length);
        
        // Show notification
        showNotification('Item added to cart!');
    }
    
    // Update cart counter
    function updateCartCount(count) {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = count;
        }
    }
    
    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove notification after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Search functionality
function setupSearchFunctionality() {
    const searchIcon = document.querySelector('.fa-search').parentElement;
    
    if (searchIcon) {
        searchIcon.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if search overlay already exists
            if (!document.querySelector('.search-overlay')) {
                const searchOverlay = document.createElement('div');
                searchOverlay.className = 'search-overlay';
                
                searchOverlay.innerHTML = `
                    <div class="search-container">
                        <form class="search-form">
                            <input type="text" placeholder="Search for products..." class="search-input">
                            <button type="submit" class="search-button">
                                <i class="fas fa-search"></i>
                            </button>
                        </form>
                        <button class="close-search">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                document.body.appendChild(searchOverlay);
                
                // Focus on input
                setTimeout(() => {
                    searchOverlay.classList.add('active');
                    searchOverlay.querySelector('.search-input').focus();
                }, 10);
                
                // Close search on click
                searchOverlay.querySelector('.close-search').addEventListener('click', function() {
                    searchOverlay.classList.remove('active');
                    setTimeout(() => {
                        document.body.removeChild(searchOverlay);
                    }, 300);
                });
                
                // Handle search form submission
                searchOverlay.querySelector('.search-form').addEventListener('submit', function(e) {
                    e.preventDefault();
                    const searchTerm = this.querySelector('.search-input').value.trim();
                    
                    if (searchTerm) {
                        window.location.href = `search-results.html?q=${encodeURIComponent(searchTerm)}`;
                    }
                });
            }
        });
    }
}

// Form validation utility
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            markInvalid(input, 'This field is required');
            isValid = false;
        } else if (input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value.trim())) {
                markInvalid(input, 'Please enter a valid email address');
                isValid = false;
            } else {
                markValid(input);
            }
        } else {
            markValid(input);
        }
    });
    
    return isValid;
}

function markInvalid(input, message) {
    input.classList.add('invalid');
    
    // Remove any existing error message
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    input.parentElement.appendChild(errorMessage);
    
    // Clear error when input changes
    input.addEventListener('input', function() {
        this.classList.remove('invalid');
        const error = this.parentElement.querySelector('.error-message');
        if (error) {
            error.remove();
        }
    }, { once: true });
}

function markValid(input) {
    input.classList.remove('invalid');
    const error = input.parentElement.querySelector('.error-message');
    if (error) {
        error.remove();
    }
}

// Animation utilities
function animateElement(element, animationClass, duration = 1000) {
    element.classList.add(animationClass);
    
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, duration);
}

// Initialize elements when they come into viewport
function initInViewportAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Call this after DOM is loaded
window.addEventListener('load', function() {
    initInViewportAnimations();
});