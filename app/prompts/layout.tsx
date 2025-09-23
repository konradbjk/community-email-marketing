import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prompts | Merck OmniA Chat",
  description: "Merck Internal Chatbot for OmniA data",
};

export default function PromptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}