import PublicPageFrame from "@/components/layout/PublicPageFrame";
import { ShieldCheck, Sparkles, Building2 } from "lucide-react";

const highlights = [
	{
		icon: Building2,
		title: "Premium Listings",
		description: "Curated homes, villas, and investment properties across the Dominican Republic.",
	},
	{
		icon: ShieldCheck,
		title: "Trusted Process",
		description: "A transparent workflow designed to help buyers move with confidence.",
	},
	{
		icon: Sparkles,
		title: "Modern Experience",
		description: "Virtual tours, raffles, and expert guidance in one polished platform.",
	},
];

export default function AboutPage() {
	return (
		<PublicPageFrame>
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
				<div className="max-w-3xl">
					<p className="text-primary-600 font-semibold uppercase tracking-[0.2em] text-xs mb-3">
						About ExpoVivienda
					</p>
					<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
						A modern real estate experience for buyers, investors, and agents.
					</h1>
					<p className="mt-4 text-lg text-gray-600 leading-relaxed">
						We combine premium property listings, virtual showcases, and expert support so every
						public page feels clear, consistent, and easy to navigate.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
					{highlights.map((item) => {
						const Icon = item.icon;

						return (
							<article key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
								<div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
									<Icon size={20} />
								</div>
								<h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
								<p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>
							</article>
						);
					})}
				</div>
			</section>
		</PublicPageFrame>
	);
}
