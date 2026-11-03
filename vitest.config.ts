import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: false,
      // Las pruebas de pantallas cargan páginas en diferido y simulan escritura: en CI pueden pasar de 5 s
      testTimeout: 15000,
    },
  }),
)
