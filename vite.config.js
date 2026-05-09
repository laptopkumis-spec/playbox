import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
    plugins: [laravel({
        input: ['resources/css/app.css', 'resources/js/app.jsx'],
        refresh: true,
    }), tailwindcss(), react(), cloudflare()],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});