declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
  ): void
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export const createClient: any
}

declare module 'https://esm.sh/@anthropic-ai/sdk@0.24.0' {
  export default class Anthropic {
    constructor(config: { apiKey?: string })
    messages: {
      create: (input: Record<string, unknown>) => Promise<any>
    }
  }
}

declare const Deno: {
  env: {
    get: (key: string) => string | undefined
  }
}

