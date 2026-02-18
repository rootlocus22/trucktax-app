import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Resources | QuickTruckTax',
};

export default function EarlyAccessPage() {
    redirect('/resources');
}
