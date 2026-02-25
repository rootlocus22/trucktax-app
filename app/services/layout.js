import UcrCtaBanner from '@/components/UcrCtaBanner';

/**
 * Phase 3: UCR CTA on Form 2290, MCS-150, IFTA, IRP, Form 8849, and other service pages.
 */
export default function ServicesLayout({ children }) {
  return (
    <>
      {children}
      <UcrCtaBanner />
    </>
  );
}
