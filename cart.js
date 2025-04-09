// cart.js - Cart functionality for SoleStyle website

// Initialize cart from localStorage or create empty cart if none exists
function initializeCart() {
    let cart = JSON.parse(localStorage.getItem('solestyleCart')) || {
        items: [],
        totalItems: 0,
        subtotal: 0
    };
    updateCartDisplay(cart.totalItems);
    return cart;
}

// Global cart object
let cart = initializeCart();

// Update the cart count display in the header
function updateCartDisplay(count) {
    const cartLink = document.querySelector('.user-actions a[href="cart.html"]');
    if (cartLink) {
        cartLink.textContent = `Cart (${count})`;
    }
}

// Add an item to the cart
function addToCart(productId, name, price, image, color = null, size = null) {
    // Check if the item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
        item.productId === productId && 
        item.color === color && 
        item.size === size
    );

    if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart.items[existingItemIndex].quantity += 1;
    } else {
        // Add new item if it doesn't exist
        cart.items.push({
            productId,
            name,
            price,
            image,
            color,
            size,
            quantity: 1
        });
    }

    // Update cart totals
    cart.totalItems += 1;
    cart.subtotal += parseFloat(price);

    // Save to localStorage
    localStorage.setItem('solestyleCart', JSON.stringify(cart));
    
    // Update the cart display
    updateCartDisplay(cart.totalItems);

    // Show feedback to user
    showAddedToCartMessage(name);
}

// Display a message when an item is added to cart
function showAddedToCartMessage(productName) {
    // Create message element
    const messageContainer = document.createElement('div');
    messageContainer.className = 'add-to-cart-message';
    messageContainer.innerHTML = `
        <p>"${productName}" added to your cart!</p>
        <a href="cart.html">View Cart</a>
    `;

    // Style the message
    Object.assign(messageContainer.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '15px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: '1000',
        maxWidth: '300px'
    });

    // Add to document
    document.body.appendChild(messageContainer);

    // Remove after 3 seconds
    setTimeout(() => {
        messageContainer.style.opacity = '0';
        messageContainer.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            document.body.removeChild(messageContainer);
        }, 500);
    }, 3000);
}

// Handle add to cart button clicks
document.addEventListener('DOMContentLoaded', function() {
    // FIXED: Get all "Add to Cart" buttons - now handles both product list and product detail pages
    // First try specific "add-to-cart" class buttons (as in men.html)
    let addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    // If none found, try generic buttons in product divs (as in women.html)
    if (addToCartButtons.length === 0) {
        addToCartButtons = document.querySelectorAll('.product button');
    }
    
    // Add click event listeners to all buttons
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Check if we're on a product listing page or product detail page
            const isProductCard = this.closest('.product-card');
            const isProductDiv = this.closest('.product');
            
            if (isProductCard) {
                // Handle product card (like in men.html)
                const productCard = isProductCard;
                const productImage = productCard.querySelector('.product-image img').src;
                const productName = productCard.querySelector('.product-info h3 a').textContent;
                
                // Get product ID from the product link
                const productLink = productCard.querySelector('.product-info h3 a').getAttribute('href');
                const productId = productLink.replace('.html', '');
                
                // Get product price
                let productPrice = productCard.querySelector('.product-price').textContent;
                // Extract number from price text (handles sale prices)
                const priceMatch = productPrice.match(/\$(\d+\.\d+)/);
                productPrice = priceMatch ? priceMatch[1] : productPrice.replace('$', '');
                
                // Add to cart
                addToCart(productId, productName, productPrice, productImage);
            } 
            else if (isProductDiv) {
                // Handle product div (like in women.html)
                const productDiv = isProductDiv;
                const productImage = productDiv.querySelector('img').src;
                const productName = productDiv.querySelector('h3').textContent;
                
                // Generate a product ID based on name if not available
                const productId = productName.toLowerCase().replace(/\s+/g, '-');
                
                // Get product price
                let productPrice = productDiv.querySelector('p:nth-of-type(2)').textContent;
                productPrice = productPrice.replace('$', '');
                
                // Add to cart
                addToCart(productId, productName, productPrice, productImage);
            }
        });
    });

    // Load cart page if we're on it
    if (window.location.pathname.includes('cart.html')) {
        loadCartPage();
    }
});

// Function to load cart on the cart page
function loadCartPage() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const cartTotal = document.getElementById('cart-total');
    const cartActions = document.querySelector('.cart-actions');
    
    if (!cartItemsContainer) return;
    
    // Clear existing cart items (except empty message)
    Array.from(cartItemsContainer.children).forEach(child => {
        if (child.id !== 'empty-cart-message') {
            cartItemsContainer.removeChild(child);
        }
    });
    
    // Handle empty cart
    if (cart.items.length === 0) {
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (cartActions) cartActions.style.display = 'none';
        return;
    }
    
    // Hide empty cart message and show actions
    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    if (cartActions) cartActions.style.display = 'flex';
    
    // Add each item to the cart
    cart.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h3><a href="${item.productId}.html">${item.name}</a></h3>
                <p>Color: ${item.color || 'Default'} | Size: ${item.size || 'Default'}</p>
                <div class="item-actions">
                    <a href="#" class="move-to-wishlist" data-id="${item.productId}">Move to Wishlist</a>
                    <a href="#" class="remove-item" data-id="${item.productId}">Remove</a>
                </div>
            </div>
            <div class="item-quantity">
                <label for="qty-${item.productId}">Qty:</label>
                <select id="qty-${item.productId}" name="qty-${item.productId}" class="quantity-select" data-id="${item.productId}">
                    ${[1, 2, 3, 4, 5].map(num => `
                        <option value="${num}" ${item.quantity === num ? 'selected' : ''}>${num}</option>
                    `).join('')}
                </select>
            </div>
            <div class="item-price">
                <p class="unit-price">$${parseFloat(item.price).toFixed(2)}</p>
                <p class="total-price">$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });
    
    // Update summary values
    const subtotal = cart.subtotal;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    
    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTax) cartTax.textContent = `$${tax.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
    
    // Add event listeners for cart actions
    setupCartEventListeners();
}

// Set up event listeners for cart page
function setupCartEventListeners() {
    // Remove item buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-id');
            removeFromCart(productId);
        });
    });
    
    // Quantity select dropdowns
    document.querySelectorAll('.quantity-select').forEach(select => {
        select.addEventListener('change', function() {
            const productId = this.getAttribute('data-id');
            const newQuantity = parseInt(this.value);
            updateCartItemQuantity(productId, newQuantity);
        });
    });
    
    // Update cart button
    const updateCartBtn = document.querySelector('.update-cart');
    if (updateCartBtn) {
        updateCartBtn.addEventListener('click', function() {
            alert('Cart updated successfully!');
        });
    }
    
    // Clear cart button
    const clearCartBtn = document.querySelector('.clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            clearCart();
        });
    }
    
    // Update the setupCartEventListeners function in cart.js

    
    // Checkout button
    const checkoutBtn = document.querySelector('.checkout-button');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            // Check if cart has items before proceeding
            if (cart.items.length === 0) {
                alert('Your cart is empty. Please add items before checkout.');
                return;
            }
            
            // Save the current cart to session storage for checkout page
            sessionStorage.setItem('checkoutCart', JSON.stringify(cart));
            
            // Redirect to checkout page
            window.location.href = 'checkout.html';
        });
    }
}

// Remove item from cart
function removeFromCart(productId) {
    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (itemIndex > -1) {
        const item = cart.items[itemIndex];
        cart.subtotal -= (item.price * item.quantity);
        cart.totalItems -= item.quantity;
        cart.items.splice(itemIndex, 1);
        
        // Save updated cart
        localStorage.setItem('solestyleCart', JSON.stringify(cart));
        updateCartDisplay(cart.totalItems);
        
        // Reload cart page
        loadCartPage();
    }
}

// Update item quantity
function updateCartItemQuantity(productId, newQuantity) {
    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (itemIndex > -1) {
        const item = cart.items[itemIndex];
        const quantityDifference = newQuantity - item.quantity;
        
        // Update item quantity
        item.quantity = newQuantity;
        
        // Update cart totals
        cart.totalItems += quantityDifference;
        cart.subtotal += (item.price * quantityDifference);
        
        // Save updated cart
        localStorage.setItem('solestyleCart', JSON.stringify(cart));
        updateCartDisplay(cart.totalItems);
        
        // Reload cart page
        loadCartPage();
    }
}

// Clear the entire cart
function clearCart() {
    cart = {
        items: [],
        totalItems: 0,
        subtotal: 0
    };
    
    // Update localStorage
    localStorage.setItem('solestyleCart', JSON.stringify(cart));
    updateCartDisplay(0);
    
    // Reload cart page
    loadCartPage();
}
document.addEventListener('DOMContentLoaded', () => {
    
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-product-id');
            const name = button.getAttribute('data-product-name');
            const price = button.getAttribute('data-product-price');
            const image = button.getAttribute('data-product-image');

            // Optional: Get color and size if available
            const colorSelect = document.querySelector('#color');
            const sizeSelect = document.querySelector('#size');
            const color = colorSelect ? colorSelect.value : null;
            const size = sizeSelect ? sizeSelect.value : null;

            // Add product to cart
            addToCart(productId, name, price, image, color, size);
        });
    });
});
// checkout.js - Checkout functionality for SoleStyle website

document.addEventListener('DOMContentLoaded', function() {
    // Get cart from session storage
    const cart = JSON.parse(sessionStorage.getItem('checkoutCart')) || {
        items: [],
        totalItems: 0,
        subtotal: 0
    };
    
    // Load checkout summary
    loadCheckoutSummary();
    
    // Setup form validation and submission
    setupCheckoutForm();
    
    // Setup payment method toggles
    setupPaymentMethods();
});

// Load the checkout summary from the cart
function loadCheckoutSummary() {
    const summaryContainer = document.getElementById('order-summary');
    if (!summaryContainer) return;
    
    const cart = JSON.parse(sessionStorage.getItem('checkoutCart')) || {
        items: [],
        totalItems: 0,
        subtotal: 0
    };
    
    // Clear previous content
    summaryContainer.innerHTML = '';
    
    // Add each item to the summary
    cart.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'summary-item';
        itemElement.innerHTML = `
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}" width="60" height="60">
            </div>
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>${item.color || 'Default'} | ${item.size || 'Default'} | Qty: ${item.quantity}</p>
            </div>
            <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        `;
        summaryContainer.appendChild(itemElement);
    });
    
    // Add order totals
    const subtotal = cart.subtotal;
    const shipping = 0; // Free shipping
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax + shipping;
    
    const totalsElement = document.createElement('div');
    totalsElement.className = 'order-totals';
    totalsElement.innerHTML = `
        <div class="total-row"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
        <div class="total-row"><span>Shipping:</span><span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span></div>
        <div class="total-row"><span>Tax (8%):</span><span>$${tax.toFixed(2)}</span></div>
        <div class="total-row grand-total"><span>Total:</span><span>$${total.toFixed(2)}</span></div>
    `;
    summaryContainer.appendChild(totalsElement);
}

// Setup checkout form validation and submission
function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return;
    
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Basic validation
        const requiredFields = checkoutForm.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('invalid');
                
                // Show error message
                const errorMsg = field.parentNode.querySelector('.error-message') || document.createElement('span');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'This field is required';
                if (!field.parentNode.querySelector('.error-message')) {
                    field.parentNode.appendChild(errorMsg);
                }
            } else {
                field.classList.remove('invalid');
                const errorMsg = field.parentNode.querySelector('.error-message');
                if (errorMsg) {
                    field.parentNode.removeChild(errorMsg);
                }
            }
        });
        
        // Email validation
        const emailField = checkoutForm.querySelector('#email');
        if (emailField && emailField.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailField.value)) {
                isValid = false;
                emailField.classList.add('invalid');
                
                const errorMsg = emailField.parentNode.querySelector('.error-message') || document.createElement('span');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'Please enter a valid email address';
                if (!emailField.parentNode.querySelector('.error-message')) {
                    emailField.parentNode.appendChild(errorMsg);
                }
            }
        }
        
        // Card validation if credit card payment is selected
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        if (paymentMethod === 'credit-card') {
            const cardFields = document.querySelectorAll('.card-fields input');
            cardFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('invalid');
                    
                    const errorMsg = field.parentNode.querySelector('.error-message') || document.createElement('span');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = 'This field is required';
                    if (!field.parentNode.querySelector('.error-message')) {
                        field.parentNode.appendChild(errorMsg);
                    }
                }
            });
            
            // Additional card number validation
            const cardNumber = document.getElementById('card-number');
            if (cardNumber && cardNumber.value.trim()) {
                if (!/^\d{16}$/.test(cardNumber.value.replace(/\s/g, ''))) {
                    isValid = false;
                    cardNumber.classList.add('invalid');
                    
                    const errorMsg = cardNumber.parentNode.querySelector('.error-message') || document.createElement('span');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = 'Please enter a valid 16-digit card number';
                    if (!cardNumber.parentNode.querySelector('.error-message')) {
                        cardNumber.parentNode.appendChild(errorMsg);
                    }
                }
            }
            
            // CVV validation
            const cvv = document.getElementById('cvv');
            if (cvv && cvv.value.trim()) {
                if (!/^\d{3,4}$/.test(cvv.value)) {
                    isValid = false;
                    cvv.classList.add('invalid');
                    
                    const errorMsg = cvv.parentNode.querySelector('.error-message') || document.createElement('span');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = 'Please enter a valid CVV';
                    if (!cvv.parentNode.querySelector('.error-message')) {
                        cvv.parentNode.appendChild(errorMsg);
                    }
                }
            }
        }
        
        // If form is valid, process order
        if (isValid) {
            processOrder(paymentMethod);
        } else {
            // Scroll to first error
            const firstError = document.querySelector('.invalid');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
    
    // Reset field validation on input
    checkoutForm.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', function() {
            this.classList.remove('invalid');
            const errorMsg = this.parentNode.querySelector('.error-message');
            if (errorMsg) {
                this.parentNode.removeChild(errorMsg);
            }
        });
    });
}

// Setup payment method toggles
function setupPaymentMethods() {
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    const cardFields = document.querySelector('.card-fields');
    const codFields = document.querySelector('.cod-fields');
    
    if (!paymentMethods.length || !cardFields || !codFields) return;
    
    // Initially hide both payment method fields
    cardFields.style.display = 'none';
    codFields.style.display = 'none';
    
    // Show relevant fields based on selected payment method
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (this.value === 'credit-card') {
                cardFields.style.display = 'block';
                codFields.style.display = 'none';
            } else if (this.value === 'cod') {
                cardFields.style.display = 'none';
                codFields.style.display = 'block';
            }
        });
        
        // Set initial state based on default selection
        if (method.checked) {
            if (method.value === 'credit-card') {
                cardFields.style.display = 'block';
            } else if (method.value === 'cod') {
                codFields.style.display = 'block';
            }
        }
    });
}

// Process the order
function processOrder(paymentMethod) {
    const cart = JSON.parse(sessionStorage.getItem('checkoutCart'));
    const formData = new FormData(document.getElementById('checkout-form'));
    
    // Create order object
    const order = {
        orderId: generateOrderId(),
        orderDate: new Date().toISOString(),
        customerInfo: {
            firstName: formData.get('first-name'),
            lastName: formData.get('last-name'),
            email: formData.get('email'),
            phone: formData.get('phone')
        },
        shippingAddress: {
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            zip: formData.get('zip'),
            country: formData.get('country')
        },
        items: cart.items,
        totals: {
            subtotal: cart.subtotal,
            tax: cart.subtotal * 0.08,
            shipping: 0,
            total: cart.subtotal + (cart.subtotal * 0.08)
        },
        payment: {
            method: paymentMethod,
            status: paymentMethod === 'cod' ? 'pending' : 'paid'
        }
    };
    
    // In a real application, you would send this to your server
    // For this demo, we'll just save it to localStorage and show a confirmation
    
    // Save order to localStorage
    let orders = JSON.parse(localStorage.getItem('solestyleOrders')) || [];
    orders.push(order);
    localStorage.setItem('solestyleOrders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.setItem('solestyleCart', JSON.stringify({
        items: [],
        totalItems: 0,
        subtotal: 0
    }));
    
    // Save order ID for confirmation page
    sessionStorage.setItem('lastOrderId', order.orderId);
    
    // Redirect to confirmation page
    window.location.href = 'order-confirmation.html';
}

// Generate a unique order ID
function generateOrderId() {
    return 'SS-' + Math.floor(Date.now() / 1000) + '-' + Math.floor(Math.random() * 1000);
}

// Format credit card number with spaces
function formatCardNumber(e) {
    const input = e.target;
    let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = '';
    
    // Add a space after every 4 digits
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    
    // Limit to 16 digits + spaces
    input.value = formattedValue.slice(0, 19);
}

