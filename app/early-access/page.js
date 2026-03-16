import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Resources | easyucr.com',
};

export default function EarlyAccessPage() {
    redirect('/resources');
}
