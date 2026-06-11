import { redirect } from "next/navigation";

// This deployment is the standalone body scanner — the scanner is the whole
// site, so the root just forwards to it.
export default function Home() {
  redirect("/scanner");
}
