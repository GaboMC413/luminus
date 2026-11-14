import MembershipChoiceView from "@/features/membership/MembershipChoiceView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forma parte de LUMINUS — Membresía",
  description: "Sé parte de la red e impulsa su crecimiento en toda Latinoamérica.",
};

export default function UnirmePage() {
  return <MembershipChoiceView />;
}
