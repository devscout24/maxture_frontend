
import PublicPageFrame from "@/components/layout/PublicPageFrame";
import PropertyDetails from "@/components/section/properti/PropertyDetail";
import { FEATURED_PROPERTIES } from "@/lib/constants";

type PropertiePagesProps = {
    searchParams: Promise<{ id?: string }>;
};

const PropertiePages = async ({ searchParams }: PropertiePagesProps) => {
    const { id } = await searchParams;
    const property = FEATURED_PROPERTIES.find((item) => item.id === id) ?? FEATURED_PROPERTIES[0];

    return (
        <PublicPageFrame noTopPadding>
            <PropertyDetails property={property} />
        </PublicPageFrame>
    );
};

export default PropertiePages;