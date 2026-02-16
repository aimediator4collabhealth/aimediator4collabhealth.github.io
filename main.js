// Import CSS
import './style.css'

// ===== CAROUSEL FUNCTIONALITY =====
class Carousel {
  constructor() {
    this.track = document.getElementById('carouselTrack');
    this.indicatorsContainer = document.getElementById('indicators');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    
    if (!this.track) return;
    
    this.slides = Array.from(this.track.children);
    this.currentIndex = 0;
    this.autoPlayInterval = null;
    
    this.init();
  }
  
  init() {
    // Create indicators
    this.createIndicators();
    
    // Add event listeners
    this.prevBtn.addEventListener('click', () => this.goToPrevious());
    this.nextBtn.addEventListener('click', () => this.goToNext());
    
    // Auto-play
    this.startAutoPlay();
    
    // Pause on hover
    this.track.parentElement.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.track.parentElement.addEventListener('mouseleave', () => this.startAutoPlay());
    
    // Initial state
    this.updateCarousel();
  }
  
  createIndicators() {
    this.slides.forEach((_, index) => {
      const indicator = document.createElement('button');
      indicator.classList.add('carousel-indicator');
      indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
      indicator.setAttribute('role', 'tab');
      indicator.addEventListener('click', () => this.goToSlide(index));
      this.indicatorsContainer.appendChild(indicator);
    });
    this.indicators = Array.from(this.indicatorsContainer.children);
  }
  
  goToSlide(index) {
    this.currentIndex = index;
    this.updateCarousel();
  }
  
  goToNext() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.updateCarousel();
  }
  
  goToPrevious() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.updateCarousel();
  }
  
  updateCarousel() {
    // Move track
    const offset = -this.currentIndex * 100;
    this.track.style.transform = `translateX(${offset}%)`;
    
    // Update indicators
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentIndex);
      indicator.setAttribute('aria-selected', index === this.currentIndex);
    });
    
    // Update button states
    this.prevBtn.disabled = false;
    this.nextBtn.disabled = false;
  }
  
  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => this.goToNext(), 5000);
  }
  
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
}

// ===== SCROLL ANIMATIONS =====
const observeElements = () => {
  const elements = document.querySelectorAll('.fade-in');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  elements.forEach(el => observer.observe(el));
};

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
};

// ===== ACTIVE MENU HIGHLIGHTING =====
const initActiveMenu = () => {
  const sections = document.querySelectorAll('section[id]');
  const menuLinks = document.querySelectorAll('.nav-menu a');
  
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Remove active class from all links
        menuLinks.forEach(link => {
          link.classList.remove('active');
        });
        
        // Add active class to current link
        const activeLink = document.querySelector(`.nav-menu a[href="#${id}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    });
  }, observerOptions);
  
  sections.forEach(section => observer.observe(section));
};

// ===== KEYBOARD NAVIGATION IMPROVEMENTS =====
const initAccessibility = () => {
  // Add focus visible styles for keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });
  
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });
};

// ===== INITIALIZE EVERYTHING =====
document.addEventListener('DOMContentLoaded', () => {
  new Carousel();
  observeElements();
  initSmoothScroll();
  initActiveMenu();
  initAccessibility();
  
  console.log('🎉 Workshop website loaded successfully!');
});

// Handle resize
window.addEventListener('resize', () => {
  // Carousel will maintain its position due to percentage-based transforms
});
