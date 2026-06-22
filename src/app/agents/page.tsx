import PublicPageFrame from "@/components/layout/PublicPageFrame";
import AgentsSection from "@/components/home/AgentsSection";

export default function AgentsPage() {
	return (
		<PublicPageFrame>
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10">
				<div className="max-w-3xl mb-10">
					<p className="text-primary-600 font-semibold uppercase tracking-[0.2em] text-xs mb-3">
						Our Agents
					</p>
					<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
						Browse the team behind the platform.
					</h1>
					<p className="mt-4 text-lg text-gray-600 leading-relaxed">
						This page uses the same polished public header style as the screenshot, while the
						content section stays reusable.
					</p>
				</div>
			</section>
			<AgentsSection />
		</PublicPageFrame>
	);
}
