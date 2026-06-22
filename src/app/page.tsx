import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import VirtualExpoSection from "@/components/home/VirtualExpoSection";
import RaffleSection from "@/components/home/RaffleSection";
import AgentsSection from "@/components/home/AgentsSection";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";



export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturedProperties />
      <VirtualExpoSection />
      <RaffleSection />
      <AgentsSection />
      <HowItWorks />
      {/* <Testimonials /> */}
      <CTASection />
      <Footer />
    </main>
  );
}
