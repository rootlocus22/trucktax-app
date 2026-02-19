import UcrCalculatorClient from './UcrCalculatorClient';

export const metadata = {
  title: 'UCR Fee Calculator | 2026 Unified Carrier Registration | QuickTruckTax',
  description: 'Calculate your UCR fee by fleet size. Official 2026 brackets. See total with our UCR Filing or UCR Pro service.',
  alternates: { canonical: 'https://www.quicktrucktax.com/tools/ucr-calculator' },
};

export default function UcrCalculatorPage() {
  return <UcrCalculatorClient />;
}
