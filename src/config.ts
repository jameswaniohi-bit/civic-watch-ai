const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const appConfig = {
  apiBaseUrl: configuredApiBaseUrl || '/api',
  aiProvider: 'Gemma',
  aiModel: import.meta.env.VITE_GEMMA_MODEL?.trim() || 'gemma-3-27b-it',
} as const
