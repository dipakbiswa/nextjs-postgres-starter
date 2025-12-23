import { getCurrentUser } from "@/lib/getCurrentUser";
import { redirect } from "next/navigation";
import Register from "./_components/Register";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }
  return <Register />;
}
