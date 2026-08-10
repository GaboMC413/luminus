import {
  Navbar,
  ContactHero,
  ContactForm,
  Footer,
} from "@/components";

export const metadata = {
  title: "Contacto | LUMINUS - Tu red de bienestar",
  description: "¿Tienes alguna pregunta, propuesta o quieres conocer más sobre LUMINUS? Escríbenos y te responderemos a la brevedad.",
};

export default function ContactoPage() {
  return (
    <main className="w-full min-h-screen bg-white flex flex-col justify-start items-start">
      <Navbar />
      <div className="w-full pt-[64px]">
        <ContactHero />
        <ContactForm />
      </div>
      <Footer />
    </main>
  );
}
