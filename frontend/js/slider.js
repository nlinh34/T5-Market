/* hiệu ứng slide cho banner ở index.html*/
document.addEventListener('DOMContentLoaded', function () {
    const slides = document.querySelector('.slides');
    const slideItems = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const dotsContainer = document.querySelector('.dots-container');

    if (slideItems.length === 0) {
        console.error('No slides found.');
        return;
    }

    let currentIndex = 1; // Start at the first real slide
    let slideInterval;
    const totalSlides = slideItems.length;

    // Clone first and last slides for infinite loop
    const firstClone = slideItems[0].cloneNode(true);
    const lastClone = slideItems[totalSlides - 1].cloneNode(true);

    slides.appendChild(firstClone);
    slides.insertBefore(lastClone, slideItems[0]);

    const allSlides = document.querySelectorAll('.slide');
    slides.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Create dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.addEventListener('click', () => {
            goToSlide(i + 1);
            resetInterval();
        });
        dotsContainer.appendChild(dot);
    }

    const dots = document.querySelectorAll('.dot');

    function updateActiveClasses() {
        const activeDotIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeDotIndex);
        });

        // Update slides for Ken Burns effect
        slideItems.forEach((s, index) => {
            s.classList.toggle('active', index === activeDotIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = index;
        slides.style.transition = 'transform 0.5s ease-in-out';
        slides.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateActiveClasses();
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }
    
    slides.addEventListener('transitionend', () => {
        if (currentIndex <= 0) {
            slides.style.transition = 'none';
            currentIndex = totalSlides;
            slides.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
        if (currentIndex >= totalSlides + 1) {
            slides.style.transition = 'none';
            currentIndex = 1;
            slides.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    });

    function startInterval() {
        slideInterval = setInterval(nextSlide, 3000);
    }

    function resetInterval() {
        clearInterval(slideInterval);
        startInterval();
    }

    // Event listeners
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });

    // Mouse hover listeners
    slides.parentElement.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    slides.parentElement.addEventListener('mouseleave', () => {
        startInterval();
    });

    // Initial setup
    updateActiveClasses();
    startInterval();
});
