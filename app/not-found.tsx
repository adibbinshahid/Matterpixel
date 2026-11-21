import type { Metadata } from "next";
import { NotFoundScene } from "@/components/NotFoundScene";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "This page doesn't exist. Head back to the homepage, see the work, or start a project.",
  // No `robots` here: Next already emits `noindex` for every 404, and a
  // second robots tag only gives crawlers two answers to reconcile.
};

export default function NotFound() {
  return <NotFoundScene />;
}
