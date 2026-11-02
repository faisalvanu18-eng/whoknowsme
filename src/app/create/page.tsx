import type { Metadata } from "next";
import { CreateFlow } from "@/components/create/create-flow";

export const metadata: Metadata = {
  title: "Create your friendship quiz",
  description: "Make a quiz about yourself in 30 seconds. Pick a template, tap your answers, share the link. No sign-up.",
  alternates: { canonical: "/create" },
};

// Fully static: the template picker is server-rendered; query params (?template=, ?ref=) are
// read on the client after hydration.
export default function CreatePage() {
  return <CreateFlow />;
}
