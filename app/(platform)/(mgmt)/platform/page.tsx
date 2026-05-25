import { redirect } from "next/navigation";
import { PLATFORM } from "@/lib/routes";

export default function PlatformHomePage() {
  redirect(PLATFORM.branches);
}
