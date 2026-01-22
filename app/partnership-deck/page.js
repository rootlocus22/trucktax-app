import PitchDeck from '@/components/PitchDeck';

export const metadata = {
    title: 'Partnership Opportunity | QuickTruckTax.com',
    description: 'Revolutionizing Trucking Compliance - Partnership Pitch Deck',
    robots: 'noindex, nofollow', // Keep the pitch deck private
};

export default function PartnershipDeckPage() {
    return (
        <div className="bg-black">
            <PitchDeck />
        </div>
    );
}
