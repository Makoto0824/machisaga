import { redirect } from "next/navigation";
import { DEFAULT_REGION } from "@/data/regions";

export default function Home() {
  redirect(`/${DEFAULT_REGION}`);
}
