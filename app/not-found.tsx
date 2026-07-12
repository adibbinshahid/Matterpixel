import type { Metadata } from "next";
import { NotFoundScene } from "@/components/NotFoundScene";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundScene />;
}
