export default function SchemaMarkup({ type, data }) {
    if (!data) return null;

    let schema = null;

    if (type === 'Service') {
        schema = {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": data.name,
            "provider": {
                "@type": "Organization",
                "name": "QuickTruckTax",
                "url": "https://www.quicktrucktax.com"
            },
            "description": data.description,
            "areaServed": "US",
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": data.catalogName || "Trucking Compliance Services",
                "itemListElement": Array.isArray(data.offers)
                    ? data.offers.map(offer => ({
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": offer.name
                        },
                        "price": offer.price,
                        "priceCurrency": "USD"
                    }))
                    : data.offers ? [{
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": data.name // Fallback to service name if single offer
                        },
                        "price": data.offers.price,
                        "priceCurrency": "USD",
                        "description": data.offers.description
                    }] : []
            }
        };
    } else if (type === 'FAQPage') {
        schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": data.map(item => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.answer
                }
            }))
        };
    }

    if (!schema) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
