import { redirect } from "next/navigation";

// a página de eventos passados saiu do site; links antigos voltam para a home.
export default function PastEventsPage() {
  redirect("/");
}
