import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import iglesia from "@/assets/iglesia.jpg";
import { churches } from "@/models/churches";
import { ChurchCarousel } from "@/views/ChurchCarousel";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fe, Historia y Patrimonio de Mérida" },
      { name: "description", content: "Un recorrido por las iglesias históricas de Mérida, Yucatán." },
      { property: "og:title", content: "Fe, Historia y Patrimonio de Mérida" },
      { property: "og:description", content: "Un recorrido por las iglesias históricas de Mérida, Yucatán." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const chapters = [
  { n: "I", t: "Piedra", d: "Templos levantados con piedra de antiguas ciudades mayas, testigos de cinco siglos de historia." },
  { n: "II", t: "Luz", d: "Cúpulas y vitrales que dejan caer una luz dorada sobre las naves durante todo el día." },
  { n: "III", t: "Silencio", d: "Espacios de recogimiento en el corazón de los barrios de Mérida." },
];

function Index() {
  const [y, setY] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState<string>("");
  const navigate = useNavigate();
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.2 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", data.user.id)
          .maybeSingle();
        setName(profile?.full_name ?? "");
      }
    });

    return () => { window.removeEventListener("scroll", onScroll); io.disconnect(); };
  }, []);

  async function openChurch(slug: string) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      navigate({ to: "/iglesias/$slug", params: { slug } });
    } else {
      navigate({ to: "/auth", search: { redirect: `/iglesias/${slug}` } });
    }
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    setUser(null);
    setName("");
  }

  return (
    <main className="text-ivory">
      <section className="relative h-screen overflow-hidden">
        <img
          src={iglesia}
          alt="Interior de la catedral"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: `scale(${1 + y / 2500}) translateY(${y * 0.3}px)` }}
        />
        <div className="hero-shade absolute inset-0" />

        <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-4 text-sm font-semibold">
          <div className="flex gap-8"><span>Iglesias <span className="opacity-60">Mérida '26</span></span><span>Ediciones</span></div>
          <div className="flex items-center gap-6">
            <span>merida.mx</span>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="font-serif italic opacity-90">Hola{name ? `, ${name.split(" ")[0]}` : ""}</span>
                <button onClick={handleSignOut} className="rounded-full border border-ivory/40 px-4 py-1.5 transition-colors hover:bg-ivory/10">
                  Salir
                </button>
              </div>
            ) : (
              <Link to="/auth" search={{ redirect: "/" }} className="rounded-full bg-ivory px-4 py-1.5 text-ink transition-transform hover:scale-105">
                Entrar
              </Link>
            )}
          </div>
        </header>

        <div className="absolute left-6 top-16 text-2xl font-semibold leading-[0.95] tracking-tight">
          La<br />Edición <span className="font-serif italic font-normal">Sagr</span>ada<br />Yucatán
        </div>

        <div className="absolute bottom-4 left-6 font-serif text-xs leading-tight opacity-80">© Iglesias de Mérida<br />Aviso de privacidad</div>

        <div className="absolute left-[14%] top-[24%] max-w-5xl" style={{ transform: `translateY(${-y * 0.4}px)`, opacity: Math.max(0, 1 - y / 600) }}>
          <h1 className="text-[clamp(3.5rem,10vw,9rem)] font-bold leading-[0.95] tracking-[-0.04em]">
            Fe, Historia<br />y Patrimonio<br />de <span className="font-serif italic font-normal">Mérida</span>
          </h1>
          <p className="mt-6 font-serif text-[clamp(1.4rem,3vw,2.5rem)] leading-[0.95] tracking-tight">
            <span className="text-[1.6em] italic">U</span>n recorrido por los templos que guardan<br />cinco siglos de fe.
          </p>
        </div>
      </section>

      <section className="bg-ink px-6 py-32">
        <p className="reveal mx-auto max-w-5xl font-serif text-[clamp(2rem,5vw,4.5rem)] leading-[1] tracking-tight">
          <span className="italic">Bienvenido</span> a las iglesias históricas de Mérida, el alma de sus barrios.
        </p>
        <div className="mx-auto mt-24 grid max-w-6xl gap-12 md:grid-cols-3">
          {chapters.map((c, i) => (
            <article key={c.n} className="reveal border-t border-ivory/30 pt-6" style={{ transitionDelay: `${i * 150}ms` }}>
              <span className="font-serif text-sm opacity-70">{c.n}</span>
              <h2 className="mt-2 text-5xl font-bold tracking-tight">{c.t}</h2>
              <p className="mt-4 font-serif text-xl leading-snug opacity-80">{c.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-parchment px-6 py-32 text-ink">
        <p className="reveal mx-auto max-w-3xl text-center font-serif text-[clamp(1.8rem,4vw,3.5rem)] leading-[1.05] tracking-tight">
          Elige un <span className="italic">templo</span> y conoce su historia
        </p>
        <p className="reveal mx-auto mt-4 max-w-xl text-center text-sm opacity-70">
          Inicia sesión para entrar a cada iglesia: horarios, capillas, eventos, libros y más.
        </p>

        <ChurchCarousel churches={churches} onOpen={openChurch} />
      </section>
    </main>
  );
}
