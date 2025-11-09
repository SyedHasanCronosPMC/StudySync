import { supabase } from './supabase'
import { useStore } from './store'

interface AppFunctionResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function buildFunctionHeaders(extra: Record<string, string> = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    await useStore.getState().logout()
    throw new Error('Session expired. Please sign in again.')
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...extra,
  }
}

function extractFunctionError(error: unknown) {
  const attempt = (body: any) => {
    if (!body) return undefined
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body)
        return parsed?.error ?? parsed?.message ?? parsed?.details ?? body
      } catch {
        return body
      }
    }
    if (typeof body === 'object') {
      const parsed = body as Record<string, unknown>
      return (
        (parsed.error as string | undefined) ??
        (parsed.message as string | undefined) ??
        (parsed.details as string | undefined) ??
        JSON.stringify(parsed)
      )
    }
    return undefined
  }

  const anyError = error as any
  const context = anyError?.context
  if (!context) {
    return undefined
  }

  return (
    attempt(context.body) ??
    attempt(context.response?.error) ??
    attempt(context.response?.data) ??
    attempt(context.response?.text) ??
    attempt(context.response) ??
    undefined
  )
}

export async function callAppFunction<T>(action: string, payload?: Record<string, unknown>): Promise<T> {
  const headers = await buildFunctionHeaders()

  const { data, error } = await supabase.functions.invoke<AppFunctionResponse<T>>('app-router', {
    headers,
    body: {
      action,
      payload,
    },
  })

  if (error) {
    const context = (error as any)?.context
    let responseText: string | undefined
    try {
      const cloned = context?.response?.clone?.()
      responseText = cloned ? await cloned.text() : undefined
    } catch {
      responseText = undefined
    }
    console.error('callAppFunction invoke error', error, responseText)
    const errorContext = (error as any)?.context
    const response = errorContext?.response
    const status = response?.status ?? response?.statusCode ?? errorContext?.status ?? null
    const serverMessage =
      extractFunctionError(error) ??
      (errorContext && (errorContext.error || errorContext.message)) ??
      error.message

    if (status === 401 || /invalid jwt/i.test(serverMessage ?? '')) {
      await useStore.getState().logout()
      throw new Error('Session expired. Please sign in again.')
    }

    throw new Error(serverMessage ?? 'Failed to call app function')
  }

  if (!data) {
    throw new Error('No response from server')
  }

  if (!data.success) {
    throw new Error(data.error ?? 'Request failed')
  }

  return data.data as T
}

