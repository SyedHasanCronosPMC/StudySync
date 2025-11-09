import { supabase } from './supabase'

interface AppFunctionResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function callAppFunction<T>(action: string, payload?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<AppFunctionResponse<T>>('app-router', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: {
      action,
      payload,
    },
  })

  if (error) {
    throw new Error(error.message ?? 'Failed to call app function')
  }

  if (!data) {
    throw new Error('No response from server')
  }

  if (!data.success) {
    throw new Error(data.error ?? 'Request failed')
  }

  return data.data as T
}

