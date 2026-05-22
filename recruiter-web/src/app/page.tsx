import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionHint = cookieStore.get("hyreme_session")?.value;

  if (sessionHint?.startsWith("recruiter:")) {
    redirect("/recruiter");
  }

  if (sessionHint?.startsWith("candidate:")) {
    redirect("/candidate");
  }

  redirect("/login");
}
