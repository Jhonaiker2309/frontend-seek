import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(() => {
    return {
        plugins: [react()],
        server: {
            hmr: true,
            watch: {
                usePolling: true,
            },
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: 'src/setupTests.ts',
            css: false,
        },
    };
});
