document.addEventListener("DOMContentLoaded", () => {
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

    lazyImageLoad();

    buttonEffect();
    mobileMenu();
});
