import UcrCalculatorClient from './UcrCalculatorClient';

export const metadata = {
  title: 'UCR Calculator 2026 – UCR Fee by Fleet Size (Official Brackets)',
  description: 'Free UCR calculator: see your exact 2026 UCR fee by fleet size in seconds. Official brackets. Then file UCR online with $0 upfront.',
  alternates: { canonical: 'https://www.easyucr.com/tools/ucr-calculator' },
};

export default function UcrCalculatorPage() {
  return <UcrCalculatorClient />;
}
