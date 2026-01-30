'use client';

import { AgentHeader } from '@/components/AgentHeader';
import { AgentFooter } from '@/components/AgentFooter';

export default function AgentLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AgentHeader />
      <main className="flex-1">
        {children}
      </main>
      <AgentFooter />
    </div>
  );
}

