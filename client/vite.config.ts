import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react(),    
    ],        
    define: {
      'process.env.VITE_GRAPHQL': JSON.stringify(env.VITE_GRAPHQL),      
    },
  };
});