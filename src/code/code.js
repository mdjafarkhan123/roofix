import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Splide from "@splidejs/splide";
import Lenis from "lenis";
document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);
    function smoothScroll() {
        const lenis = new Lenis({
            wheelMultiplier: 1.6,
            smoothWheel: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }
    function slider() {
        const splideEl = document.querySelector(".splide");
        if (!splideEl) return;

        const splide = new Splide(splideEl, {
            type: "loop",
            perPage: 3,
            gap: "2rem",
            arrows: false,
            pagination: false,
            breakpoints: {
                1024: { perPage: 2 },
                640: { perPage: 1 },
            },
        });

        splide.mount();

        const prevBtn = document.querySelectorAll(
            ".slider-controls__btn--prev"
        );
        const nextBtn = document.querySelectorAll(
            ".slider-controls__btn--next"
        );

        prevBtn.forEach((item) => {
            item?.addEventListener("click", () => {
                splide.go("<");
            });
        });
        nextBtn.forEach((item) => {
            item?.addEventListener("click", () => {
                splide.go("<");
            });
        });
    }
    function mobileMenu() {
        const breakpoint = 992;
        if (window.innerWidth >= breakpoint) {
            const menu = document.getElementById("main-navigation");
            if (menu) {
                menu.style.transform = "translateX(0)";
                const menuIcon = document.querySelector(
                    ".header__menu-toggler"
                );
                if (menuIcon) {
                    menuIcon.setAttribute("aria-expanded", "false");
                }
            }
            return; // Exit the function if the screen is desktop size
        }
        const menuIcon = document.querySelector(".header__menu-toggler");
        const menu = document.getElementById("main-navigation");
        const menuItem = menu?.querySelectorAll(".header__menu-item");
        if (!menuIcon || !menu) return;

        let openState = menuIcon?.getAttribute("aria-expanded") === "true";

        function toggle() {
            menuIcon.setAttribute("aria-expanded", openState);
            if (openState) {
                menu.style.transform = "translateX(0)";
            } else {
                menu.style.transform = "translateX(100%)";
            }
        }

        menuIcon?.addEventListener("click", (e) => {
            openState = !openState;
            toggle();
        });

        menuItem?.forEach((item) => {
            item.addEventListener("click", (e) => {
                openState = !openState;
                toggle();
            });
        });
    }
    function buttonEffect() {
        const buttons = document.querySelectorAll(".btn");
        buttons.forEach((button) => {
            const bg = button.querySelector(".btn__bg");

            const handleOrigin = (e) => {
                const rect = button.getBoundingClientRect();
                bg.style.left = `${e.clientX - rect.left}px`;
                bg.style.top = `${e.clientY - rect.top}px`;
            };

            button.addEventListener("mousemove", handleOrigin);
        });
    }

    function lazyImageLoad() {
        const lazyBGs = document.querySelectorAll(".lazy-bg");

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    el.style.backgroundImage = `url(${el.dataset.bg})`;
                    io.unobserve(el);
                }
            });
        });

        lazyBGs.forEach((el) => io.observe(el));
    }
    function cardStackingEffect() {
        const cards = document.querySelectorAll(".projects__item");
        const container = document.querySelector(".projects__list");
        const lastCard = cards[cards.length - 1];

        cards.forEach((card, index) => {
            // Skip the last card
            if (index === cards.length - 1) return;

            // Define the next card for the scaling end point
            const nextCard = cards[index + 1];

            // 1. PINNING LOGIC
            // (Stays pinned until the very last card, as you requested)
            ScrollTrigger.create({
                trigger: card,
                start: "top 60",
                endTrigger: lastCard,
                end: "top 100",
                pin: true,
                pinSpacing: false,
                id: `pin-${index}`,
            });

            // 2. SCALING LOGIC
            // (Only runs until the NEXT card reaches the top)
            gsap.to(card, {
                scale: 0.7,
                ease: "none",
                scrollTrigger: {
                    trigger: card,
                    start: "top 100",
                    endTrigger: nextCard,
                    end: "top 100",
                    scrub: 1.4,
                    id: `scale-${index}`,
                },
            });
        });
    }
    function counterAnimation() {
        // Select all elements containing the numbers
        const counters = document.querySelectorAll(".stats__item-value");

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

    function serviceAnimation() {
        if (window.innerWidth < 992) return;
        const services = document.querySelectorAll(".service-item");

        services.forEach((service) => {
            ScrollTrigger.create({
                trigger: service,
                start: "top 60%",
                end: "bottom+=60 60%",
                toggleClass: "active-service",
            });
        });
    }
    smoothScroll();
    mobileMenu();
    buttonEffect();
    lazyImageLoad();
    slider();
    cardStackingEffect();
    counterAnimation();
    serviceAnimation();
});
