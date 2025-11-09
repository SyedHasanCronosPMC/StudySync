import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://jygnmkuezhhuycecnfef.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Z25ta3VlemhodXljZWNuZmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzczNzcsImV4cCI6MjA3ODIxMzM3N30.peuvfZf5bUFoE21JwDWeHyAv9_eJMVPE9YSZTL7m34U')

async function main() {
  const { data, error } = await supabase.functions.invoke('app-router', {
    body: { action: 'dashboard.load' },
  })

  console.log('data', data)
  console.log('error', error)
}

main().catch((err) => {
  console.error('invoke failed', err)
})
