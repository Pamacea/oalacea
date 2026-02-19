import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Charge .env.local en priorité (connexion directe pour CLI)
config()

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
