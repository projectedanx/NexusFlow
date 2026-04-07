/**
 * @fileoverview Vite build configuration for the NexusFlow React application.
 * Manages environment variable loading, server ports, and path aliasing.
 */

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load environment variables based on the current build mode (e.g., 'development' or 'production')
    const env = loadEnv(mode, '.', '');

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Expose the GEMINI_API_KEY environment variable to the client bundle safely
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // Resolve '@/' to the root directory
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
