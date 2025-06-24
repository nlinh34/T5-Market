
document.addEventListener('DOMContentLoaded', function() {
    // Thumbnail image click handler
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            this.classList.add('active');
            
            // Change main image
            const newImageSrc = this.getAttribute('data-image');
            mainImage.src = newImageSrc;
        });
    });
    
    // Quantity selector
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    const quantityInput = document.querySelector('.quantity-input');
    
    minusBtn.addEventListener('click', function() {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });
    
    plusBtn.addEventListener('click', function() {
        let currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
    });
    
    // Tab switching
    const tabHeaders = document.querySelectorAll('.tabs-header li');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabHeaders.forEach((header, index) => {
        header.addEventListener('click', function() {
            // Remove active class from all headers and panes
            tabHeaders.forEach(h => h.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked header and corresponding pane
            this.classList.add('active');
            tabPanes[index].classList.add('active');
        });
    });
    
    // Star rating in review form
    const stars = document.querySelectorAll('.rating-input i');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            
            // Highlight stars up to the clicked one
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('fas', 'active');
                    s.classList.remove('far');
                } else {
                    s.classList.add('far');
                    s.classList.remove('fas', 'active');
                }
            });
        });
    });
    
    // Mobile menu toggle (reuse from main.js if available)
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
});

       // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');

        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Quantity controls
        const quantityBtns = document.querySelectorAll('.quantity-btn');
        const quantityInputs = document.querySelectorAll('.quantity-input');
        const removeBtns = document.querySelectorAll('.remove-btn');

        quantityBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const input = e.target.parentElement.querySelector('.quantity-input');
                let value = parseInt(input.value);

                if (e.target.textContent === '+' || e.target.classList.contains('fa-plus')) {
                    input.value = value + 1;
                } else if (e.target.textContent === '-' || e.target.classList.contains('fa-minus')) {
                    if (value > 1) {
                        input.value = value - 1;
                    }
                }
                updateCartTotal();
            });
        });

        quantityInputs.forEach(input => {
            input.addEventListener('change', () => {
                if (input.value < 1) input.value = 1;
                updateCartTotal();
            });
        });

        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('tr').remove();
                updateCartTotal();
            });
        });

        function updateCartTotal() {
            // This function would calculate totals based on quantities and prices
            // In a real implementation, you would update the totals here
            console.log('Cart updated');
        }