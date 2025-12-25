import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Splide from "@splidejs/splide";
import Lenis from "lenis";

// Configuration
const CONFIG = {
    BREAKPOINTS: {
        MOBILE: 768,
        TABLET: 992,
        DESKTOP: 1024,
    },
    LENIS: {
        wheelMultiplier: 1.6,
        smoothWheel: true,
    },
    SPLIDE: {
        type: "loop",
        perPage: 3,
        gap: "2rem",
        arrows: false,
        pagination: false,
    },
};

// Utility: Throttle for performance
function throttle(func, delay) {
    let timeoutId = null;
    let lastCall = 0;

    return function (...args) {
        const now = Date.now();
        const timeSinceLastCall = now - lastCall;

        if (timeSinceLastCall >= delay) {
            lastCall = now;
            func.apply(this, args);
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                func.apply(this, args);
            }, delay - timeSinceLastCall);
        }
    };
}

// Smooth scroll
function initSmoothScroll() {
    const lenis = new Lenis(CONFIG.LENIS);

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

// Slider
function initSlider() {
    const splideEl = document.querySelector(".splide");
    if (!splideEl) return;

    const splide = new Splide(splideEl, {
        ...CONFIG.SPLIDE,
        breakpoints: {
            [CONFIG.BREAKPOINTS.DESKTOP]: { perPage: 2 },
            640: { perPage: 1 },
        },
    }).mount();

    const prevBtns = document.querySelectorAll(".slider-controls__btn--prev");
    const nextBtns = document.querySelectorAll(".slider-controls__btn--next");

    prevBtns.forEach((btn) =>
        btn.addEventListener("click", () => splide.go("<"))
    );
    nextBtns.forEach((btn) =>
        btn.addEventListener("click", () => splide.go(">"))
    );
}

// Mobile menu
function initMobileMenu() {
    const menuIcon = document.querySelector(".header__menu-toggler");
    const menu = document.getElementById("main-navigation");

    if (!menuIcon || !menu || window.innerWidth >= CONFIG.BREAKPOINTS.TABLET)
        return;

    const menuItems = menu.querySelectorAll(".header__menu-item");
    let isOpen = menuIcon.getAttribute("aria-expanded") === "true";

    function toggleMenu() {
        isOpen = !isOpen;
        menuIcon.setAttribute("aria-expanded", String(isOpen));
        menu.style.transform = isOpen ? "translateX(0%)" : "translateX(100%)";
    }

    function closeMenu() {
        if (isOpen) {
            isOpen = false;
            menuIcon.setAttribute("aria-expanded", "false");
            menu.style.transform = "translateX(100%)";
        }
    }

    menuIcon.addEventListener("click", toggleMenu);
    menuItems.forEach((item) => item.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
    });
}

// Button effect
function initButtonEffect() {
    if (window.innerWidth < CONFIG.BREAKPOINTS.MOBILE) return;

    const buttons = document.querySelectorAll(".btn");

    buttons.forEach((button) => {
        const bg = button.querySelector(".btn__bg");
        if (!bg) return;

        let rect = null;

        button.addEventListener("mouseenter", (e) => {
            rect = button.getBoundingClientRect();
            bg.style.left = `${e.clientX - rect.left}px`;
            bg.style.top = `${e.clientY - rect.top}px`;
            void bg.offsetWidth;
            bg.style.transition = "transform 0.5s ease-out, opacity 0.3s";
        });

        button.addEventListener("mouseleave", (e) => {
            if (!rect) return;
            bg.style.transition = "all 0.5s ease-out";
            bg.style.left = `${e.clientX - rect.left}px`;
            bg.style.top = `${e.clientY - rect.top}px`;
            rect = null;
        });

        button.addEventListener(
            "mousemove",
            throttle((e) => {
                if (!rect) return;
                bg.style.left = `${e.clientX - rect.left}px`;
                bg.style.top = `${e.clientY - rect.top}px`;
            }, 16)
        );
    });
}

// Lazy image loading
function initLazyImageLoad() {
    const lazyBGs = document.querySelectorAll(".lazy-bg");
    if (!lazyBGs.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const bgUrl = el.dataset.bg;

                    if (bgUrl) {
                        el.style.backgroundImage = `url(${bgUrl})`;
                        observer.unobserve(el);
                    }
                }
            });
        },
        { rootMargin: "100px" }
    );

    lazyBGs.forEach((el) => observer.observe(el));
}

// Card stacking effect
function initCardStackingEffect() {
    if (window.innerWidth < CONFIG.BREAKPOINTS.MOBILE) return;

    const cards = document.querySelectorAll(".projects__item");
    if (cards.length < 2) return;

    const lastCard = cards[cards.length - 1];

    cards.forEach((card, index) => {
        if (index === cards.length - 1) return;

        const nextCard = cards[index + 1];

        ScrollTrigger.create({
            trigger: card,
            start: "top 60",
            endTrigger: lastCard,
            end: "top 100",
            pin: true,
            pinSpacing: false,
        });

        gsap.to(card, {
            scale: 0.7,
            ease: "none",
            scrollTrigger: {
                trigger: card,
                start: "top 100",
                endTrigger: nextCard,
                end: "top 100",
                scrub: 1.4,
            },
        });
    });
}

// Counter animation
function initCounterAnimation() {
    const counters = document.querySelectorAll(".stats__item-value");
    if (!counters.length) return;

    counters.forEach((counter) => {
        gsap.from(counter, {
            scrollTrigger: {
                trigger: counter,
                start: "top 85%",
                end: "top bottom",
                toggleActions: "restart none none restart",
            },
            innerText: 0,
            duration: 2,
            ease: "power1.out",
            snap: { innerText: 1 },
        });
    });
}

// Service animation
function initServiceAnimation() {
    if (window.innerWidth < CONFIG.BREAKPOINTS.TABLET) return;

    const services = document.querySelectorAll(".service-item");
    if (!services.length) return;

    services.forEach((service) => {
        ScrollTrigger.create({
            trigger: service,
            start: "top 60%",
            end: "bottom+=60 60%",
            toggleClass: "active-service",
        });
    });
}

// Slide up animation
function initSlideUpAnimation() {
    if (window.innerWidth < CONFIG.BREAKPOINTS.MOBILE) return;

    const elements = document.querySelectorAll(".slide-up");
    if (!elements.length) return;

    elements.forEach((element) => {
        gsap.from(element, {
            opacity: 0,
            y: 120,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: element,
                start: "top 85%",
            },
        });
    });
}

// Scale in animation
function initScaleInAnimation() {
    if (window.innerWidth < CONFIG.BREAKPOINTS.MOBILE) return;

    const elements = document.querySelectorAll(".scale-in");
    if (!elements.length) return;

    elements.forEach((element) => {
        gsap.from(element, {
            opacity: 0,
            scale: 1.5,
            duration: 1.3,
            ease: "power2.out",
            scrollTrigger: {
                trigger: element,
                start: "bottom 85%",
            },
        });
    });
}

// Main initialization
function init() {
    gsap.registerPlugin(ScrollTrigger);

    initSmoothScroll();
    initMobileMenu();
    initButtonEffect();
    initLazyImageLoad();
    initSlider();
    initCardStackingEffect();
    initCounterAnimation();
    initServiceAnimation();
    initSlideUpAnimation();
    initScaleInAnimation();

    // Handle window resize with throttle
    window.addEventListener(
        "resize",
        throttle(() => {
            ScrollTrigger.refresh();
        }, 300)
    );
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", init);
