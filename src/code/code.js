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

    return { destroy: () => lenis.destroy() };
}

// Slider with CORRECT button directions
function initSlider() {
    const splideEl = document.querySelector(".splide");
    if (!splideEl) return null;

    const splide = new Splide(splideEl, {
        ...CONFIG.SPLIDE,
        breakpoints: {
            [CONFIG.BREAKPOINTS.DESKTOP]: { perPage: 2 },
            640: { perPage: 1 },
        },
    });

    splide.mount();

    // FIXED: Correct button directions
    const prevBtns = document.querySelectorAll(".slider-controls__btn--prev");
    const nextBtns = document.querySelectorAll(".slider-controls__btn--next");

    const prevHandler = () => splide.go("<"); // Previous goes backward
    const nextHandler = () => splide.go(">"); // Next goes forward

    prevBtns.forEach((btn) => btn.addEventListener("click", prevHandler));
    nextBtns.forEach((btn) => btn.addEventListener("click", nextHandler));

    return {
        destroy: () => {
            splide.destroy();
            prevBtns.forEach((btn) =>
                btn.removeEventListener("click", prevHandler)
            );
            nextBtns.forEach((btn) =>
                btn.removeEventListener("click", nextHandler)
            );
        },
    };
}

// Mobile menu with keyboard support
function initMobileMenu() {
    const { TABLET } = CONFIG.BREAKPOINTS;
    const menuIcon = document.querySelector(".header__menu-toggler");
    const menu = document.getElementById("main-navigation");

    if (!menuIcon || !menu) return null;

    // Desktop: reset state and exit
    if (window.innerWidth >= TABLET) {
        menu.style.transform = "translateX(0)";
        menuIcon.setAttribute("aria-expanded", "false");
        return null;
    }

    const menuItems = menu.querySelectorAll(".header__menu-item");
    let isOpen = menuIcon.getAttribute("aria-expanded") === "true";

    function toggleMenu() {
        isOpen = !isOpen;
        menuIcon.setAttribute("aria-expanded", String(isOpen));
        menu.style.transform = isOpen ? "translateX(0)" : "translateX(100%)";
    }

    function closeMenu() {
        if (isOpen) {
            isOpen = false;
            menuIcon.setAttribute("aria-expanded", "false");
            menu.style.transform = "translateX(100%)";
        }
    }

    function handleEscape(e) {
        if (e.key === "Escape") closeMenu();
    }

    menuIcon.addEventListener("click", toggleMenu);
    menuItems.forEach((item) => item.addEventListener("click", closeMenu));
    document.addEventListener("keydown", handleEscape);

    return {
        destroy: () => {
            menuIcon.removeEventListener("click", toggleMenu);
            menuItems.forEach((item) =>
                item.removeEventListener("click", closeMenu)
            );
            document.removeEventListener("keydown", handleEscape);
        },
    };
}

// Button effect with proper cleanup and performance
function initButtonEffect() {
    if (window.innerWidth < CONFIG.BREAKPOINTS.MOBILE) return null;

    const buttons = document.querySelectorAll(".btn");
    const handlers = [];

    buttons.forEach((button) => {
        const bg = button.querySelector(".btn__bg");
        if (!bg) return;

        let rect = null;

        // Enter: snap to mouse position instantly
        const handleEnter = (e) => {
            rect = button.getBoundingClientRect();

            bg.style.left = `${e.clientX - rect.left}px`;
            bg.style.top = `${e.clientY - rect.top}px`;

            // Force reflow and re-enable transitions
            void bg.offsetWidth;
            bg.style.transition = "transform 0.5s ease-out, opacity 0.3s";
        };

        // Leave: animate to exit point
        const handleLeave = (e) => {
            if (!rect) return;

            bg.style.transition = "all 0.5s ease-out";
            bg.style.left = `${e.clientX - rect.left}px`;
            bg.style.top = `${e.clientY - rect.top}px`;
            rect = null;
        };

        // Optional: track mouse movement while hovering (if you want continuous tracking)
        // Throttled for performance
        const handleMove = throttle((e) => {
            if (!rect) return;
            bg.style.left = `${e.clientX - rect.left}px`;
            bg.style.top = `${e.clientY - rect.top}px`;
        }, 16);

        button.addEventListener("mouseenter", handleEnter);
        button.addEventListener("mouseleave", handleLeave);

        handlers.push({
            button,
            handleEnter,
            handleLeave,
            handleMove,
        });
    });

    return {
        destroy: () => {
            handlers.forEach(
                ({ button, handleEnter, handleLeave, handleMove }) => {
                    button.removeEventListener("mouseenter", handleEnter);
                    button.removeEventListener("mouseleave", handleLeave);
                    button.removeEventListener("mousemove", handleMove);
                }
            );
        },
    };
}

// Lazy image loading with cleanup
function initLazyImageLoad() {
    const lazyBGs = document.querySelectorAll(".lazy-bg");
    if (!lazyBGs.length) return null;

    let loadedCount = 0;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const bgUrl = el.dataset.bg;

                    if (bgUrl) {
                        el.style.backgroundImage = `url(${bgUrl})`;
                        observer.unobserve(el);
                        loadedCount++;

                        // Auto-disconnect when all images loaded
                        if (loadedCount === lazyBGs.length) {
                            observer.disconnect();
                        }
                    }
                }
            });
        },
        { rootMargin: "100px" } // Load 100px before entering viewport
    );

    lazyBGs.forEach((el) => observer.observe(el));

    return {
        destroy: () => observer.disconnect(),
    };
}

// Card stacking effect
function initCardStackingEffect() {
    if (window.innerWidth < CONFIG.BREAKPOINTS.MOBILE) return null;

    const cards = document.querySelectorAll(".projects__item");
    if (cards.length < 2) return null;

    const lastCard = cards[cards.length - 1];
    const triggers = [];

    cards.forEach((card, index) => {
        if (index === cards.length - 1) return;

        const nextCard = cards[index + 1];

        // Pin until last card
        const pinTrigger = ScrollTrigger.create({
            trigger: card,
            start: "top 60",
            endTrigger: lastCard,
            end: "top 100",
            pin: true,
            pinSpacing: false,
        });

        // Scale until next card
        const animation = gsap.to(card, {
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

        triggers.push(pinTrigger, animation.scrollTrigger);
    });

    return {
        destroy: () => triggers.forEach((t) => t?.kill()),
    };
}

// Counter animation
function initCounterAnimation() {
    const counters = document.querySelectorAll(".stats__item-value");
    if (!counters.length) return null;

    const animations = [];

    counters.forEach((counter) => {
        const animation = gsap.from(counter, {
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

        animations.push(animation.scrollTrigger);
    });

    return {
        destroy: () => animations.forEach((t) => t?.kill()),
    };
}

// Service animation
function initServiceAnimation() {
    if (window.innerWidth < CONFIG.BREAKPOINTS.TABLET) return null;

    const services = document.querySelectorAll(".service-item");
    if (!services.length) return null;

    const triggers = [];

    services.forEach((service) => {
        const trigger = ScrollTrigger.create({
            trigger: service,
            start: "top 60%",
            end: "bottom+=60 60%",
            toggleClass: "active-service",
        });

        triggers.push(trigger);
    });

    return {
        destroy: () => triggers.forEach((t) => t.kill()),
    };
}

// Main initialization
function init() {
    gsap.registerPlugin(ScrollTrigger);

    const instances = {
        smoothScroll: initSmoothScroll(),
        mobileMenu: initMobileMenu(),
        buttonEffect: initButtonEffect(),
        lazyImageLoad: initLazyImageLoad(),
        slider: initSlider(),
        cardStacking: initCardStackingEffect(),
        counterAnimation: initCounterAnimation(),
        serviceAnimation: initServiceAnimation(),
    };

    // Handle window resize
    const handleResize = throttle(() => {
        // Reinitialize breakpoint-dependent features
        const breakpointFeatures = [
            "mobileMenu",
            "buttonEffect",
            "cardStacking",
            "serviceAnimation",
        ];

        breakpointFeatures.forEach((feature) => {
            if (instances[feature]?.destroy) {
                instances[feature].destroy();
            }

            // Reinitialize based on feature name
            switch (feature) {
                case "mobileMenu":
                    instances[feature] = initMobileMenu();
                    break;
                case "buttonEffect":
                    instances[feature] = initButtonEffect();
                    break;
                case "cardStacking":
                    instances[feature] = initCardStackingEffect();
                    break;
                case "serviceAnimation":
                    instances[feature] = initServiceAnimation();
                    break;
            }
        });

        ScrollTrigger.refresh();
    }, 300);

    window.addEventListener("resize", handleResize);

    // Global cleanup (useful for SPAs or page transitions)
    window.__destroyAnimations = () => {
        window.removeEventListener("resize", handleResize);
        Object.values(instances).forEach((instance) => {
            if (instance?.destroy) instance.destroy();
        });
        ScrollTrigger.getAll().forEach((t) => t.kill());
    };

    return instances;
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", init);
