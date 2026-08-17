import { Navbar, ContactHero, Footer } from "@/components";

export const metadata = {
  title: "Contacto | LUMINUS - Tu red de bienestar",
  description: "¿Tienes alguna pregunta, propuesta o quieres conocer más sobre LUMINUS? Escríbenos y te responderemos a la brevedad.",
};

export default function ContactoPage() {
  return (
    <main className="w-full min-h-screen bg-black text-white flex flex-col justify-between pt-[64px]">
      <Navbar />

      <div className="w-full flex-1 flex flex-col justify-center bg-black text-white">
        <ContactHero />
      </div>

      <Footer />
    </main>
  );
}
