import { redirect } from "next/navigation";

export const RICKROLL_URL = "https://www.youjustgot.com/";

export const metadata = {
  title: ".env",
  description: "Redirecting...",
};

export default function DotEnvRedirect() {
  redirect(RICKROLL_URL);
}
