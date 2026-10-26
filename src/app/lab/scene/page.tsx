import { notFound } from "next/navigation";
import { LabScene } from "./LabScene";

export const metadata = { robots: { index: false, follow: false } };

export default function Page() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_LAB !== "1") notFound();
  return <LabScene />;
}
