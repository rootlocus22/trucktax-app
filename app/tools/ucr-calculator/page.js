import UcrCalculatorClient from './UcrCalculatorClient';

export const metadata = {
  title: 'UCR Calculator 2026 – UCR Fee by Fleet Size (Official Brackets)',
  description: 'Free UCR calculator: official 2026 government brackets plus tiered EasyUCR service fees. See your full estimated total, then file with guided checkout.',
  alternates: { canonical: 'https://www.easyucr.com/tools/ucr-calculator' },
};

export default function UcrCalculatorPage() {
  return <UcrCalculatorClient />;
}
