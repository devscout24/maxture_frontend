import PublicPageFrame from "@/components/layout/PublicPageFrame";
import VirtualExpoSection from "@/components/home/VirtualExpoSection";

export default function VirtualExpoPage() {
	return (
		<PublicPageFrame>
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10">
				<div className="max-w-3xl mb-10">
					<p className="text-primary-600 font-semibold uppercase tracking-[0.2em] text-xs mb-3">
						Virtual Expo
					</p>
					<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
						Explore properties through immersive digital fairs.
					</h1>
					<p className="mt-4 text-lg text-gray-600 leading-relaxed">
						The navigation and page framing match the screenshot across non-home routes.
					</p>
				</div>
			</section>
			<VirtualExpoSection />
		</PublicPageFrame>
	);
}
