import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Create Account",
  description:
    "Join TempChair free as a dental professional or clinic. Post shifts, apply to jobs, and staff chairs without agency fees.",
  path: "/sign-up",
  // Allow indexing — acquisition page
  noIndex: false,
});

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
