import { stateData } from './stateData';

export const generateCityPosts = () => {
    const cityPosts = [];

    stateData.forEach(state => {
        state.cities.forEach(city => {
            const citySlug = city.toLowerCase().replace(/\s+/g, '-');
            const stateSlug = state.name.toLowerCase().replace(/\s+/g, '-');

            cityPosts.push({
                id: `form-2290-filing-in-${citySlug}-${state.abbr.toLowerCase()}`,
                title: `Form 2290 Filing in ${city}, ${state.abbr} (2025 Guide)`,
                excerpt: `Trucking in ${city}? Here is your local guide to filing IRS Form 2290, finding weigh stations near ${city}, and handling ${state.dmv} registration.`,
                category: 'City Guides',
                readTime: '4 min',
                date: 'November 2025',
                dateISO: '2025-11-27',
                keywords: [`Form 2290 ${city}`, `HVUT ${city} ${state.abbr}`, `truck taxes ${city}`, `IRS office ${city}`, `trucking jobs ${city}`],
                tableOfContents: [
                    { id: 'local-reqs', title: `Filing Form 2290 in ${city}` },
                    { id: 'registration', title: `${city} Registration & Tags` },
                    { id: 'resources', title: `Trucking Resources in ${city}` },
                ],
                relatedPosts: [`form-2290-filing-guide-${stateSlug}`, 'file-form-2290-from-phone-guide'],
                content: (
                    <>
                        <div className="bg-gray-50 border-l-4 border-gray-600 p-6 mb-8">
                            <p className="font-bold text-lg mb-2">🏙️ {city} Trucking Hub</p>
                            <p><strong>{city}, {state.name}</strong> is a major logistics center. Whether you are hauling locally or long-haul, staying compliant with the IRS and {state.dmv} is critical for your business.</p>
                        </div>

                        <p className="mb-6">
                            As a trucker based in or operating through {city}, you have specific needs. This guide breaks down exactly how to handle your Heavy Vehicle Use Tax (HVUT) so you can get back on the road.
                        </p>

                        <h2 id="local-reqs" className="text-3xl font-bold mt-12 mb-6">Filing Form 2290 in {city}</h2>

                        <p className="mb-4">You do not need to visit an IRS office in {city} to file. The fastest way is to e-file.</p>

                        <ul className="list-disc ml-6 mb-6 space-y-2">
                            <li><strong>Deadline:</strong> August 31st annually.</li>
                            <li><strong>Tax Amount:</strong> Depends on weight (e.g., 55,000 lbs = $100).</li>
                            <li><strong>Payment:</strong> Pay online via EFW or Credit Card to avoid mailing checks from {city}.</li>
                        </ul>

                        <h2 id="registration" className="text-3xl font-bold mt-12 mb-6">{city} Registration & Tags</h2>

                        <p className="mb-4">To renew your tags at a DMV/Tag Office in the {city} area, you must present your <strong>Schedule 1</strong>.</p>

                        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm mb-6">
                            <h3 className="font-bold text-lg mb-2">📍 Local Tips:</h3>
                            <p className="text-sm">Avoid the lines! Most {state.name} IRP renewals can be done online. Ensure your address in {city} matches your Form 2290 exactly.</p>
                        </div>

                        <h2 id="resources" className="text-3xl font-bold mt-12 mb-6">Trucking Resources in {city}</h2>

                        <p className="mb-4">Need a scale or repair shop? {city} has plenty of options:</p>

                        <ul className="list-disc ml-6 mb-6 space-y-2">
                            <li><strong>Weigh Stations:</strong> Check the major interstates leaving {city}.</li>
                            <li><strong>Parking:</strong> Secure parking is available at major truck stops on the outskirts of {city}.</li>
                        </ul>

                        <div className="bg-gradient-to-r from-[var(--color-midnight)] to-[var(--color-navy-soft)] text-white rounded-lg p-8 mt-12 text-center shadow-lg">
                            <h2 className="text-3xl font-bold mb-4">File 2290 in {city} Now</h2>
                            <p className="text-xl mb-6 opacity-90">
                                Get your Schedule 1 in minutes and skip the trip to the IRS office.
                            </p>
                            <div className="flex justify-center gap-4">
                                <a href="https://www.expresstrucktax.com" target="_blank" rel="nofollow" className="bg-[var(--color-sky)] text-white px-6 py-3 rounded font-bold hover:bg-blue-600 transition">E-File for {city}</a>
                            </div>
                        </div>
                    </>
                ),
            });
        });
    });

    return cityPosts;
};
