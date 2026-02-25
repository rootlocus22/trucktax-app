import UcrCtaBanner from '@/components/UcrCtaBanner';

/**
 * Phase 3: UCR CTA on resources (2290 due date, compliance calendar, etc.).
 */
export default function ResourcesLayout({ children }) {
  return (
    <>
      {children}
      <UcrCtaBanner />
    </>
  );
}
