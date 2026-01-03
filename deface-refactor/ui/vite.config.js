import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Include .js files for JSX
      include: '**/*.{jsx,js}',
    }),
  ],

  // ESBuild options - tell it to treat .js as JSX
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },

  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },

  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: true,
    strictPort: false,
    
    // API proxy configuration
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
    },

    cors: true,

    hmr: {
      overlay: true,
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2015',
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          icons: ['lucide-react'],
        },
      },
    },

    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
  },

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@context': path.resolve(__dirname, './src/context'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
    extensions: ['.js', '.jsx', '.json'],
  },

  // CSS configuration
  css: {
    devSourcemap: true,
  },

  // Preview server configuration
  preview: {
    port: 3000,
    host: true,
    strictPort: false,
    open: true,
  },

  // Environment variables prefix
  envPrefix: 'REACT_APP_',

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts', 'lucide-react', 'axios'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
  },
});
