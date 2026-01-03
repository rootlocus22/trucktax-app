import { getPseoRoutes } from "@/lib/pseo/data";
import DirectoryClient from "./DirectoryClient";

export const metadata = {
    title: "2025-2026 Form 2290 Tax Directory | QuickTruckTax",
    description: "Search and filter our complete library of over 2,300+ expert tax guides, including state specifics, vehicle weights, and VIN decoders.",
};

export default function DirectoryPage() {
    const allRoutes = getPseoRoutes();

    return <DirectoryClient allRoutes={allRoutes} />;
}
