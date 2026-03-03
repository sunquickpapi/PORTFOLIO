// === SMOOTH SCROLL NAVIGATION ===
document.querySelectorAll('.dock-item[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// === ACTIVE SECTION OBSERVER ===
const dockItems = document.querySelectorAll('.dock-item[href^="#"]');
const sections = document.querySelectorAll('section[id]');

const activeObserverOptions = {
    threshold: 0.2, // Adjust threshold for better detection
    rootMargin: "-10% 0px -70% 0px" // Trigger slightly before the section reaches center
};

const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            dockItems.forEach(item => {
                const isActive = item.getAttribute('href') === `#${id}`;
                item.classList.toggle('active', isActive);

                // Active state for tooltips or styling if needed
                if (isActive) {
                    // console.log(`Active section: ${id}`);
                }
            });
        }
    });
}, activeObserverOptions);

sections.forEach(section => activeObserver.observe(section));

// === SCROLL REVEAL (SUBTLE) ===
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('section, .project-card, .stat-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// === FORM HANDLING ===
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        alert(`Thank you, ${name}! I'll get back to you at ${email} shortly.`);
        contactForm.reset();
    });
}

// Console Log
console.log('Minimalist Portfolio Initialized ✨');

// === PREVIEW MODAL & CAROUSEL LOGIC ===
const modal = document.getElementById('imageModal');
const openBtns = document.querySelectorAll('.open-modal-btn');
const closeBtn = document.getElementById('closeModalBtn');
const overlay = document.getElementById('modalOverlay');
const carouselContainer = document.getElementById('carouselContainer');
const carouselDots = document.getElementById('carouselDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentIndex = 0;
let autoSlideInterval;
let slides = [];
let dots = [];

function updateCarousel() {
    if (!carouselContainer || dots.length === 0) return;
    carouselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(showNext, 4000);
}

function stopAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
}

function resetAutoSlide() {
    startAutoSlide();
}

function showNext() {
    if (slides.length === 0) return;
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
}

function showPrev() {
    if (slides.length === 0) return;
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
}

// Dynamic Carousel Generation
function setupCarousel(imageUrls) {
    if (!carouselContainer || !carouselDots) return;

    // Clear existing
    carouselContainer.innerHTML = '';
    carouselDots.innerHTML = '';

    // Create slides
    imageUrls.forEach((url, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        const img = document.createElement('img');
        img.src = url.trim();
        img.alt = `Project Screenshot ${index + 1}`;
        slide.appendChild(img);
        carouselContainer.appendChild(slide);

        const dot = document.createElement('span');
        dot.className = 'dot';
        if (index === 0) dot.classList.add('active');
        dot.setAttribute('data-index', index);
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
            resetAutoSlide();
        });
        carouselDots.appendChild(dot);
    });

    slides = carouselContainer.querySelectorAll('.carousel-slide');
    dots = carouselDots.querySelectorAll('.dot');
    currentIndex = 0;
    updateCarousel();
}

// Open Modal
openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const imagesAttr = btn.getAttribute('data-images');
        const frameType = btn.getAttribute('data-frame') || 'phone';

        if (imagesAttr) {
            const imageUrls = imagesAttr.split(',');
            setupCarousel(imageUrls);

            // Set frame type
            const deviceFrame = document.getElementById('deviceFrame');
            if (deviceFrame) {
                deviceFrame.classList.remove('phone', 'laptop');
                deviceFrame.classList.add(frameType);
            }

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            startAutoSlide();
        }
    });
});

// Close Modal
function closeModal() {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        stopAutoSlide();
    }
}

if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (overlay) overlay.addEventListener('click', closeModal);

// Carousel Navigation
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        showNext();
        resetAutoSlide();
    });
}
if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        showPrev();
        resetAutoSlide();
    });
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('active')) return;

    if (e.key === 'ArrowRight') {
        showNext();
        resetAutoSlide();
    }
    if (e.key === 'ArrowLeft') {
        showPrev();
        resetAutoSlide();
    }
    if (e.key === 'Escape') closeModal();
});

// Touch Events
let touchStartX = 0;
let touchEndX = 0;

if (carouselContainer) {
    carouselContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
    }, { passive: true });

    carouselContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoSlide();
    }, { passive: true });
}

function handleSwipe() {
    if (touchStartX - touchEndX > 50) {
        showNext();
    } else if (touchEndX - touchStartX > 50) {
        showPrev();
    }
}

// === PROJECT DETAILS MODAL LOGIC ===
const projectDetailsModal = document.getElementById('projectDetailsModal');
const closeDetailsBtn = document.getElementById('closeDetailsBtn');
const detailsOverlay = document.getElementById('detailsOverlay');

const projectsData = {
    'ppas-app': {
        title: 'PPASRATUHUB Application',
        date: 'January 2025',
        tags: ['SwiftUI', 'Firebase', 'AppStore', 'SQLite'],
        hero: 'assets/ppasRTUhub%20header.jpg',
        desc: `
            <h3>The Challenge</h3>
            <p>Prior to this application, users relied on fragmented platforms and manual, in-person processes to access library services. Managing facility bookings, tracking borrowed books, and registering for events created a "hassle" for users, indicating a critical need to consolidate these disjointed workflows into a convenient, digital solution.</p>
            <h3>The Solution</h3>
            <p>Developed PPASRATUHUB, a seamless and user-friendly mobile application that centralizes all PPAS services. This "mobile-first" solution digitizes the experience, allowing users to instantly book events, reserve facilities (like study rooms), and track borrowing history and due dates from a single interface.</p>
        `,
        live: 'https://apps.apple.com/my/app/ppas/id6752301341',
        repo: '#',
        preview: {
            frame: 'phone',
            images: 'assets/ppas2.jpeg,assets/ppas3.jpeg,assets/ppas4.jpeg,assets/ppas5.jpeg,assets/ppas1.jpeg'
        }
    },
    'sport-app': {
        title: 'Collaborative E-Commerce',
        date: 'December 2024',
        tags: ['SQL', 'Web Dev', 'PHP', 'XAMPP'],
        hero: 'assets/lvnastudio%20header.png',
        desc: `
            <h3>The Challenge</h3>
            <p>The primary difficulty lay in facilitating custom apparel orders that required complex coordination between four distinct parties: Customers, Agents, Designers, and Admins. Relying on fragmented tools for communication and manual tracking created a disconnected workflow where critical design feedback was often lost between stakeholders.</p>
            <h3>The Solution</h3>
            <p>LVNASTUDIO was engineered to handle the intricate database relationships required for a multi-role ecosystem. The platform features specialized dashboards for each user type, including a "Custom Your Own" module and a collaborative chat interface where Agents can mediate design changes.</p>
        `,
        live: '#',
        repo: '#',
        preview: {
            frame: 'laptop',
            images: 'assets/lvnastudio header.png,assets/luna1.png,assets/luna2.png,assets/luna3.png'
        }
    },
    'ppas-web': {
        title: 'PPASRTUHUB Websites',
        date: 'November 2024',
        tags: ['Web Dev', 'SQL', 'Analytics', 'HTML/CSS'],
        hero: 'assets/ppasweb1.jpeg',
        desc: `
            <h3>The Challenge</h3>
            <p>Managing the diverse resources of the Perbadanan Perpustakaan Awam Selangor (PPAS)—from high-tech recording studios to basic inventory—was operationally complex. The lack of a centralized digital system led to potential double-bookings and inefficient resource allocation.</p>
            <h3>The Solution</h3>
            <p>Developed the PPAS Portal, a comprehensive web-based administration system. The system features a Facility & Studio Management engine, Inventory Tracking, and a centralized Analytics Dashboard featuring real-time charts for room booking frequency and facility trends.</p>
        `,
        live: '#',
        repo: '#',
        preview: {
            frame: 'laptop',
            images: 'assets/ppasweb1.jpeg,assets/ppasweb4.jpeg,assets/ppasweb5.jpeg,assets/ppasweb2.jpeg,assets/ppasweb3.jpeg'
        }
    },
    'cook-king': {
        title: 'CookKing Application',
        date: 'October 2024',
        tags: ['SwiftUI', 'XCode', 'iOS', 'Firebase'],
        hero: 'assets/ck%20header.jpg',
        desc: `
            <h3>The Challenge</h3>
            <p>Home cooks often struggle with deciding "what to eat" and executing complex recipes without errors. Static text recipes can lead to timing mistakes or incorrect portion sizes. There was a need for an interactive digital assistant.</p>
            <h3>The Solution</h3>
            <p>Developed Cook King (CK), a native iOS application built using SwiftUI. The application provides Smart Cooking Assistance through an integrated "Smart Timer" and Dynamic Portion Control with a "Choose Your Pax" selector that automatically adjusts ingredient quantities.</p>
        `,
        live: '#',
        repo: '#',
        preview: {
            frame: 'phone',
            images: 'assets/ck1.png,assets/ck2.png,assets/ck3.png,assets/ck4.png,assets/ck5.png,assets/ck6.png,assets/ck7.png'
        }
    },
    'job-seek': {
        title: 'JobSeek Application',
        date: 'September 2024',
        tags: ['Mobile Dev', 'UI/UX', 'Accessibility', 'Inclusion'],
        hero: 'assets/js%20header.png',
        desc: `
            <h3>The Challenge</h3>
            <p>The job market often presents invisible barriers to the disabled community. Key challenges include Information Asymmetry, where job seekers lack clarity on an employer's true inclusivity, and standard job boards that are rarely optimized for assistive software.</p>
            <h3>The Solution</h3>
            <p>JobSeek is a comprehensive mobile platform designed to bridge the gap. I implemented Smart & Inclusive Job Search through a personalized Disability Profiling system. This is paired with Accommodation Transparency, where listings explicitly highlight verified inclusive features.</p>
        `,
        live: '#',
        repo: '#',
        preview: {
            frame: 'phone',
            images: 'assets/js1.png,assets/js2.png,assets/js3.png,assets/js4.png,assets/js5.jpeg,assets/js6.png,assets/js7.png,assets/js8.png'
        }
    },
    'dear-skin': {
        title: 'DearSkin Application',
        date: 'August 2024',
        tags: ['Mobile Dev', 'Firebase', 'Skincare logic', 'UI/UX'],
        hero: 'assets/ds%20header.png',
        desc: `
            <h3>The Challenge</h3>
            <p>Maintaining a consistent skincare routine is overwhelming due to a lack of guided pacing. Users face Product Confusion regarding layering order, while Subjective Progress makes it difficult to see gradual changes.</p>
            <h3>The Solution</h3>
            <p>DearSkin serves as a personalized digital hub that simplifies skincare through Guided Routines & Layering. I developed a smart layering guide and an AI-Powered Progress Tracking system where users log photos for visual analysis.</p>
        `,
        live: '#',
        repo: '#',
        preview: {
            frame: 'phone',
            images: 'assets/ds1.png,assets/ds2.png,assets/ds4.png,assets/ds5.png,assets/ds6.png,assets/ds7.png,assets/ds8.png,assets/ds9.png,assets/ds10.png'
        }
    }
};

function openProjectDetails(projectId) {
    const data = projectsData[projectId];
    if (!data) return;

    // Populate modal
    document.getElementById('detailsHero').src = data.hero;
    document.getElementById('detailsTitle').innerText = data.title;
    document.getElementById('detailsDate').innerText = data.date;
    document.getElementById('detailsDesc').innerHTML = data.desc;

    // Tags
    const tagsContainer = document.getElementById('detailsTags');
    tagsContainer.innerHTML = '';
    data.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.innerText = tag;
        tagsContainer.appendChild(span);
    });

    // Links
    const liveLink = document.getElementById('modalLiveLink');
    const repoLink = document.getElementById('modalRepoLink');
    liveLink.href = data.live;
    repoLink.href = data.repo;

    // Hide repo if empty or '#'
    repoLink.style.display = (data.repo && data.repo !== '#') ? 'flex' : 'none';
    liveLink.style.display = (data.live && data.live !== '#') ? 'flex' : 'none';

    // Preview Button
    const previewBtn = document.getElementById('modalPreviewBtn');
    previewBtn.onclick = () => {
        closeDetails();
        // Trigger the image preview modal
        const dummyBtn = document.createElement('button');
        dummyBtn.setAttribute('data-images', data.preview.images);
        dummyBtn.setAttribute('data-frame', data.preview.frame);

        // We can just call the setup and open logic directly
        const imageUrls = data.preview.images.split(',');
        setupCarousel(imageUrls);
        const deviceFrame = document.getElementById('deviceFrame');
        if (deviceFrame) {
            deviceFrame.classList.remove('phone', 'laptop');
            deviceFrame.classList.add(data.preview.frame);
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        startAutoSlide();
    };

    // Show modal
    projectDetailsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDetails() {
    if (projectDetailsModal) {
        projectDetailsModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', closeDetails);
if (detailsOverlay) detailsOverlay.addEventListener('click', closeDetails);

// === DYNAMIC STATS ===
function updateHeroStats() {
    // Tally projects
    const cards = document.querySelectorAll('.project-new-card');
    const projectCount = cards.length;

    // Update Hero stats
    const heroProjectsCountEl = document.getElementById('projectsCount');
    if (heroProjectsCountEl) {
        heroProjectsCountEl.innerText = `${projectCount}+`;
    }

    // Update About stats
    const aboutProjectsCountEl = document.getElementById('about-projectsCount');
    if (aboutProjectsCountEl) {
        aboutProjectsCountEl.innerText = `${projectCount}+ Projects Completed`;
    }

    // Calculate years in coding
    const startDate = new Date('2022-01-01'); // Journey start
    const today = new Date();
    let years = today.getFullYear() - startDate.getFullYear();

    // Adjust if current month/day is before start month/day
    const m = today.getMonth() - startDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < startDate.getDate())) {
        years--;
    }

    const count = Math.max(0, years);

    // Update Hero stats
    const heroExperienceYearsEl = document.getElementById('experienceYears');
    if (heroExperienceYearsEl) {
        heroExperienceYearsEl.innerText = `${count}+`;
    }

    // Update About stats
    const aboutExperienceYearsEl = document.getElementById('about-experienceYears');
    if (aboutExperienceYearsEl) {
        aboutExperienceYearsEl.innerText = `${count}+ Years of Experience`;
    }
}

// === PROFESSIONAL CERTIFICATIONS PREVIEW LOGIC ===
function initCertPreview() {
    const certCards = document.querySelectorAll('.cert-card');
    const overlay = document.getElementById('cert-preview-overlay');
    const previewImg = document.getElementById('cert-preview-img');

    if (!overlay || !previewImg) return;

    certCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const previewUrl = card.getAttribute('data-preview');
            if (previewUrl) {
                previewImg.src = previewUrl;
                overlay.classList.add('active');
            }
        });

        card.addEventListener('mouseleave', () => {
            overlay.classList.remove('active');
        });

        card.addEventListener('mousemove', (e) => {
            // Position the overlay relative to the viewport
            // Add a small offset so it doesn't cover the cursor
            const offsetX = 20;
            const offsetY = 20;

            let x = e.clientX + offsetX;
            let y = e.clientY + offsetY;

            // Prevent overlay from going off-screen
            const overlayWidth = overlay.offsetWidth;
            const overlayHeight = overlay.offsetHeight;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            if (x + overlayWidth > windowWidth) {
                x = e.clientX - overlayWidth - offsetX;
            }
            if (y + overlayHeight > windowHeight) {
                y = e.clientY - overlayHeight - offsetY;
            }

            overlay.style.left = `${x}px`;
            overlay.style.top = `${y}px`;
        });
    });
}

// === PROJECT FILTERS & GALLERY LOGIC ===
function initProjectFilters() {
    const tabs = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.project-section');
    const searchInput = document.getElementById('projectSearch');
    const filterBtn = document.getElementById('filterBtn');
    const filterMenu = document.getElementById('filterMenu');
    const filterOptions = document.querySelectorAll('.filter-option');
    const filterWrapper = document.getElementById('devFilterWrapper');
    const showingText = document.getElementById('showingText');

    let activeTab = 'dev';
    let activeFilter = 'all';

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            activeTab = target;
            activeFilter = 'all'; // Reset filter on tab change

            // Update UI
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(`${target}ProjectsSection`).classList.add('active');

            // Update Filter Options Based on Tab
            updateFilterMenu(target);

            filterProjects();
        });
    });

    function updateFilterMenu(type) {
        if (!filterMenu) return;

        let optionsHtml = '';
        if (type === 'dev') {
            optionsHtml = `
                <div class="filter-title">Project Type</div>
                <button class="filter-option active" data-filter="all">All Projects</button>
                <button class="filter-option" data-filter="Full-Stack">Full-Stack</button>
                <button class="filter-option" data-filter="Front-End">Front-End</button>
                <button class="filter-option" data-filter="Back-End">Back-End</button>
                <button class="filter-option" data-filter="Others">Others</button>
            `;
        } else {
            optionsHtml = `
                <div class="filter-title">Photography Category</div>
                <button class="filter-option active" data-filter="all">All Photos</button>
                <button class="filter-option" data-filter="Scenery">Scenery</button>
                <button class="filter-option" data-filter="Figures">Figures</button>
            `;
        }
        filterMenu.innerHTML = optionsHtml;

        // Re-attach listeners to new buttons
        const newOptions = filterMenu.querySelectorAll('.filter-option');
        newOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                activeFilter = opt.getAttribute('data-filter');
                newOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                filterProjects();
            });
        });
    }

    // Initial menu setup
    updateFilterMenu('dev');

    // Search Logic
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterProjects();
        });
    }

    // Filter Dropdown Toggle
    if (filterBtn) {
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterMenu.classList.toggle('active');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', () => {
        if (filterMenu) filterMenu.classList.remove('active');
    });

    function filterProjects() {
        const query = searchInput.value.toLowerCase();
        let visibleCount = 0;
        let totalCount = 0;

        if (activeTab === 'dev') {
            const cards = document.querySelectorAll('#devProjectsSection .project-new-card');
            totalCount = cards.length;
            cards.forEach(card => {
                const title = card.querySelector('h3').innerText.toLowerCase();
                const tags = Array.from(card.querySelectorAll('.tag')).map(t => t.innerText.toLowerCase()).join(' ');
                const type = card.getAttribute('data-type');

                const matchesSearch = title.includes(query) || tags.includes(query);
                const matchesFilter = activeFilter === 'all' || type === activeFilter;

                if (matchesSearch && matchesFilter) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            showingText.innerText = `Showing ${visibleCount} of ${totalCount} projects`;
        } else {
            const cards = document.querySelectorAll('#shootProjectsSection .project-shoot-card');
            totalCount = cards.length;
            cards.forEach(card => {
                const alt = card.querySelector('img').alt.toLowerCase();
                const type = card.getAttribute('data-type');

                const matchesSearch = alt.includes(query);
                const matchesFilter = activeFilter === 'all' || type === activeFilter;

                if (matchesSearch && matchesFilter) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            showingText.innerText = `Showing ${visibleCount} of ${totalCount} photos`;
        }
    }

    // Photographic Shoot Spotlight Effect
    const shootCards = document.querySelectorAll('.project-shoot-card');
    shootCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
}

// Initialize everything on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    updateHeroStats();
    initCertPreview();
    initProjectFilters(); // New filter initialization
    console.log('Dynamic Stats, Cert Previews & Project Filters Initialized 🚀');
});

// === COPY TO CLIPBOARD ===
function copyToClipboard(text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const originalHTML = btnElement.innerHTML;
        btnElement.classList.add('copied');
        btnElement.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;

        // Tooltip feedback if it exists
        const originalTitle = btnElement.getAttribute('title');
        btnElement.setAttribute('title', 'Copied!');

        setTimeout(() => {
            btnElement.classList.remove('copied');
            btnElement.innerHTML = originalHTML;
            btnElement.setAttribute('title', originalTitle);
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}
