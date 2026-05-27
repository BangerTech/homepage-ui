export const dynamic = "force-dynamic";

import { readTextFile } from "@/lib/config";
import CustomClient from "./CustomClient";

export default function CustomPage() {
  let css = "";
  let js = "";
  let loadError = "";
  try {
    css = readTextFile("custom.css");
    js = readTextFile("custom.js");
  } catch (e) {
    loadError = String(e);
  }
  return <CustomClient initialCss={css} initialJs={js} loadError={loadError} />;
}
