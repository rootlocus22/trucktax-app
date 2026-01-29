import { loadStripe } from '@stripe/stripe-js';

let stripePromise;
let lastUsedKey;

const getStripe = () => {
    const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!stripePromise || lastUsedKey !== publicKey) {
        lastUsedKey = publicKey;
        stripePromise = loadStripe(publicKey);
    }
    return stripePromise;
};


export default getStripe;
