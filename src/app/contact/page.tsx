import ContactAgentPage from "@/components/agents/ContactAgentForm";
import PublicPageFrame from "@/components/layout/PublicPageFrame";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
	return (
		<PublicPageFrame>
			<ContactAgentPage />
		</PublicPageFrame>
	);
}