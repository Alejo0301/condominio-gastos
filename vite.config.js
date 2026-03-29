import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANTE: cambia 'condominio-gastos' por el nombre exacto de tu repo en GitHub
export default defineConfig({
  plugins: [react()],
  base: '/condominio-gastos/',
})
