import React from 'react'
import { Brain } from 'lucide-react'

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-2 text-foreground">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-semibold">StudySync</span>
          <span className="text-muted-foreground">© {currentYear}</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="#" className="transition-colors hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Terms
          </a>
          <a href="mailto:hello@studysync.ai" className="transition-colors hover:text-foreground">
            Support
          </a>
        </div>
      </div>
    </footer>
  )
}

