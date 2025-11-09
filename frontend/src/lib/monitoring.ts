import * as Sentry from '@sentry/react'

const dsn = import.meta.env.VITE_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllInputs: false,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    replaysSessionSampleRate: Number(import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? 0.05),
    replaysOnErrorSampleRate: Number(import.meta.env.VITE_SENTRY_REPLAYS_ERROR_SAMPLE_RATE ?? 1.0),
    environment: import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE ?? 'development',
  })
  console.info('[monitoring] Sentry initialised')
} else {
  if (import.meta.env.DEV) {
    console.info('[monitoring] Sentry DSN not provided – monitoring disabled')
  }
}

