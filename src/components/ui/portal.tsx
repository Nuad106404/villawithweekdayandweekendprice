import * as React from 'react'
import * as PortalPrimitive from '@radix-ui/react-portal'

interface PortalProps extends React.ComponentPropsWithoutRef<typeof PortalPrimitive.Root> {
  children: React.ReactNode
}

export function Portal({ children, ...props }: PortalProps) {
  return (
    <PortalPrimitive.Root {...props}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          {children}
        </div>
      </div>
    </PortalPrimitive.Root>
  )
}
