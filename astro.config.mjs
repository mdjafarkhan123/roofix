import { defineConfig } from "astro/config";

export default defineConfig({
    vite: {
        build: {
            cssCodeSplit: true, // Creates separate CSS files per import
        },
    },
});
