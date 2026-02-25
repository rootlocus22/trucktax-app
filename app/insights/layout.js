import UcrCtaBanner from '@/components/UcrCtaBanner';

/**
 * Phase 3: All insight/guide pages get the persistent UCR CTA bar.
 */
export default function InsightsLayout({ children }) {
  return (
    <>
      {children}
      <UcrCtaBanner />
    </>
  );
}
