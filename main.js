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

// ===== HAMBURGER MENU =====
const initHamburgerMenu = () => {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const backdrop = document.querySelector('.menu-backdrop');
  const navLinks = document.querySelectorAll('.nav-menu a');
  
  console.log('Hamburger menu init:', {
    hamburger: !!hamburger,
    navMenu: !!navMenu,
    backdrop: !!backdrop,
    navLinks: navLinks.length
  });
  
  if (!hamburger || !navMenu || !backdrop) {
    console.warn('Hamburger menu elements not found');
    return;
  }
  
  const toggleMenu = (open) => {
    console.log('Toggle menu:', open);
    hamburger.classList.toggle('active', open);
    navMenu.classList.toggle('active', open);
    backdrop.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', open);
    
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  // Toggle menu on hamburger click
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = hamburger.classList.contains('active');
    toggleMenu(!isActive);
  });
  
  // Close menu when clicking backdrop
  backdrop.addEventListener('click', () => {
    console.log('Backdrop clicked');
    toggleMenu(false);
  });
  
  // Close menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      console.log('Menu link clicked');
      toggleMenu(false);
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

// ===== DYNAMIC PUBLICATIONS LIST =====
const initPublications = async () => {
  const container = document.getElementById('publicationsList');
  if (!container) return;

  try {
    // Smart fetch: try root path (for build/prod) first, fallback to public folder (for local Live Server)
    let response;
    let isDev = false;
    try {
      response = await fetch('papers-metadata.json');
      if (!response.ok) throw new Error();
    } catch (e) {
      response = await fetch('public/papers-metadata.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch papers-metadata.json`);
      }
      isDev = true;
    }
    const papers = await response.json();

    if (!papers || papers.length === 0) {
      container.innerHTML = '<p class="no-papers-text">No publications accepted yet. Stay tuned!</p>';
      return;
    }

    container.innerHTML = ''; // Clear loading text
    
    papers.forEach(paper => {
      const card = document.createElement('div');
      card.classList.add('publication-card', 'fade-in');
      
      let authorsHtml = '';
      if (paper.authors) {
        authorsHtml = `<p class="publication-authors">${paper.authors}</p>`;
      }
      
      let affiliationsHtml = '';
      if (paper.affiliations) {
        affiliationsHtml = `<p class="publication-affiliations">${paper.affiliations}</p>`;
      }

      // If running locally in dev/Live Server, we must prepend 'public/' to download/view URLs
      let paperUrl = paper.url;
      if (isDev && paperUrl && !paperUrl.startsWith('public/')) {
        paperUrl = 'public/' + paperUrl;
      }

      card.innerHTML = `
        <div class="publication-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pdf-icon">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div class="publication-details">
          <h3 class="publication-title">
            <a href="${paperUrl}" target="_blank" rel="noopener noreferrer" class="publication-link">${paper.title}</a>
          </h3>
          ${authorsHtml}
          ${affiliationsHtml}
        </div>
        <div class="publication-actions">
          <a href="${paperUrl}" download="${paper.filename}" class="btn-download" aria-label="Download ${paper.title}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="download-icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download</span>
          </a>
        </div>
      `;
      container.appendChild(card);
    });

    // Observe newly added publication card elements
    observeElements();
  } catch (error) {
    console.error('Error loading publications:', error);
    container.innerHTML = '<p class="error-text">Failed to load publications. Please try again later.</p>';
  }
};

// ===== INITIALIZE EVERYTHING =====
document.addEventListener('DOMContentLoaded', () => {
  new Carousel();
  observeElements();
  initSmoothScroll();
  initHamburgerMenu();
  initActiveMenu();
  initAccessibility();
  initPublications();
  
  console.log('🎉 Workshop website loaded successfully!');
});

// Handle resize
window.addEventListener('resize', () => {
  // Carousel will maintain its position due to percentage-based transforms
});

