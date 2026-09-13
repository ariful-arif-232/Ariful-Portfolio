import type { ReactNode } from 'react'

export function SectionHeading({
  title,
  lead,
  action,
}: {
  title: string
  lead?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2
          className="font-display font-semibold tracking-[-0.02em]"
          style={{ fontSize: 'clamp(1.625rem, 3.4vw, 2.25rem)' }}
        >
          {title}
        </h2>
        {lead ? <p className="prose-body mt-3">{lead}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
