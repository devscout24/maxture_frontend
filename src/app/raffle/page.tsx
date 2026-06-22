import RafflesItem from "@/components/section/RafflesItem/RafflesItem";
import PublicPageFrame from "@/components/layout/PublicPageFrame";
import WinnersSection from "@/components/home/WinnersSection";
import RaffleHowItWorks from "@/components/section/RaffleHowItWorks";



const RafflePages = () => {
    return (
        <PublicPageFrame noTopPadding>
            <RafflesItem />
            <RaffleHowItWorks />
            <WinnersSection />
        </PublicPageFrame>
    );
};

export default RafflePages;