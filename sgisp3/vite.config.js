import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // <-- permite conexiones externas
    port: 5173,        // <-- opcional, el puerto de Vite
    strictPort: true   // <-- evita que cambie de puerto
  }

})
