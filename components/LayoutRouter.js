'use client';

import { usePathname } from 'next/navigation';
import { ConsumerLayout } from './ConsumerLayout';

export function LayoutRouter({ children }) {
  const pathname = usePathname();
  
  // Check if current route is an agent route
  const isAgentRoute = pathname?.startsWith('/agent');
  
  if (isAgentRoute) {
    // Agent routes use their own layout (defined in app/agent/layout.js)
    // This wrapper just passes through - the agent layout will handle header/footer
    return <>{children}</>;
  }
  
  // Consumer routes use ConsumerLayout
  return <ConsumerLayout>{children}</ConsumerLayout>;
}

