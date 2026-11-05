import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getChurch } from "@/models/churches";
import placeholder from "@/assets/iglesia-placeholder.svg";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/iglesias/$slug")({
  beforeLoad: ({ params }) => {
    const church = getChurch(params.slug);
    if (!church) throw notFound();
    return { church };
  },
  head: ({ params }) => {
    const church = getChurch(params.slug);
    return {
      meta: [
        { title: `${church?.name ?? "Iglesia"} — Iglesias de Mérida` },
        { name: "description", content: church?.tagline ?? "Iglesia histórica de Mérida, Yucatán." },
      ],
    };
  },
  component: ChurchPage,
});

const sections = [
  { id: "historia", label: "Historia", roman: "I" },
  { id: "capillas", label: "Capillas", roman: "II" },
  { id: "horarios", label: "Horarios", roman: "III" },
  { id: "ubicacion", label: "Ubicación", roman: "IV" },
  { id: "contacto", label: "Contacto", roman: "V" },
  { id: "objetos", label: "Objetos de historia", roman: "VI" },
  { id: "eventos", label: "Eventos", roman: "VII" },
  { id: "libros", label: "Libros en PDF", roman: "VIII" },
];

function ChurchPage() {
  const { church, queryClient } = Route.useRouteContext();
  const [y, setY] = useState(0);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.15 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    supabase.auth.getUser().then(async ({ data }) => {
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

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(church.mapQuery)}&z=17&output=embed`;

  return (
    <main className="text-ivory">
      <section className="relative h-screen overflow-hidden">
        <img
          src={church.image}
          alt={church.name}
          width={1024}
          height={1280}
          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = placeholder; }}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: `scale(${1 + y / 2500}) translateY(${y * 0.3}px)` }}
        />
        <div className="hero-shade absolute inset-0" />

        <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-4 text-sm font-semibold">
          <Link to="/" className="transition-opacity hover:opacity-70">← Iglesias <span className="opacity-60">Mérida '26</span></Link>
          <div className="flex items-center gap-4">
            <span className="font-serif italic opacity-90">Hola{name ? `, ${name.split(" ")[0]}` : ""}</span>
            <button onClick={handleSignOut} className="rounded-full border border-ivory/40 px-4 py-1.5 transition-colors hover:bg-ivory/10">
              Salir
            </button>
          </div>
        </header>

        <nav className="absolute bottom-24 left-6 hidden w-52 text-lg font-semibold leading-[1.15] tracking-tight md:block">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="flex justify-between transition-opacity hover:opacity-70">
              <span>{s.label}</span><span className="font-serif text-xs font-normal opacity-80">{s.roman}</span>
            </a>
          ))}
        </nav>
        <div className="absolute bottom-4 left-6 font-serif text-xs leading-tight opacity-80">© {church.name}<br />Mérida, Yucatán</div>

        <div className="absolute left-[16%] top-[24%] max-w-4xl md:left-[24%]" style={{ transform: `translateY(${-y * 0.4}px)`, opacity: Math.max(0, 1 - y / 600) }}>
          <p className="font-serif text-lg italic opacity-90">desde {church.founded}</p>
          <h1 className="mt-2 text-[clamp(3rem,9vw,8rem)] font-bold leading-[0.95] tracking-[-0.04em]">{church.name}</h1>
          <p className="mt-6 font-serif text-[clamp(1.4rem,3vw,2.5rem)] leading-[0.95] tracking-tight">
            <span className="text-[1.5em] italic">{church.tagline.charAt(0)}</span>{church.tagline.slice(1)}
          </p>
        </div>
      </section>

      <div className="bg-ink">
        <Section id="historia" roman="I" title="Historia">
          <div className="space-y-6">
            {church.history.map((p, i) => (
              <p key={i} className="font-serif text-[clamp(1.3rem,2.5vw,2rem)] leading-snug opacity-90">{p}</p>
            ))}
          </div>
        </Section>

        <Section id="capillas" roman="II" title="Capillas">
          <div className="grid gap-8 md:grid-cols-2">
            {church.capillas.map((c) => (
              <article key={c.name} className="rounded-[1.5rem] border border-ivory/15 p-6">
                <h3 className="text-2xl font-bold tracking-tight">{c.name}</h3>
                <p className="mt-3 font-serif text-lg leading-snug opacity-80">{c.note}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="horarios" roman="III" title="Horarios de misa">
          <div className="max-w-2xl divide-y divide-ivory/15">
            {church.horarios.map((h) => (
              <div key={h.day} className="flex items-baseline justify-between gap-6 py-4">
                <span className="text-lg font-semibold">{h.day}</span>
                <span className="font-serif text-lg italic opacity-80">{h.hours}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="ubicacion" roman="IV" title="Ubicación">
          <div className="overflow-hidden rounded-[2rem] border border-ivory/15">
            <iframe
              title={`Mapa de ${church.name}`}
              src={mapSrc}
              className="h-[28rem] w-full border-0"
              loading="lazy"
            />
          </div>
          <p className="mt-4 font-serif text-lg italic opacity-80">{church.contacto.address}</p>
        </Section>

        <Section id="contacto" roman="V" title="Contacto">
          <div className="grid gap-8 md:grid-cols-3">
            <div><p className="text-xs font-semibold uppercase tracking-widest opacity-60">Dirección</p><p className="mt-2 font-serif text-lg leading-snug">{church.contacto.address}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-widest opacity-60">Teléfono</p><p className="mt-2 font-serif text-lg">{church.contacto.phone}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-widest opacity-60">Correo</p><p className="mt-2 font-serif text-lg">{church.contacto.email}</p></div>
          </div>
        </Section>

        <Section id="objetos" roman="VI" title="Objetos de historia">
          <div className="grid gap-8 md:grid-cols-2">
            {church.objetos.map((o) => (
              <article key={o.name} className="border-t border-ivory/25 pt-5">
                <h3 className="text-2xl font-bold tracking-tight">{o.name}</h3>
                <p className="mt-3 font-serif text-lg leading-snug opacity-80">{o.note}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="eventos" roman="VII" title="Eventos y donativos">
          <div className="grid gap-8 md:grid-cols-2">
            {church.eventos.map((e) => (
              <article key={e.name} className="rounded-[1.5rem] bg-parchment p-6 text-ink">
                <h3 className="text-2xl font-bold tracking-tight">{e.name}</h3>
                <p className="mt-3 font-serif text-lg leading-snug opacity-80">{e.note}</p>
                <button className="mt-5 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-ivory transition-transform hover:scale-105">
                  Apartar o donar
                </button>
              </article>
            ))}
          </div>
        </Section>

        <Section id="libros" roman="VIII" title="Libros en PDF">
          <div className="max-w-2xl divide-y divide-ivory/15">
            {church.libros.map((l) => (
              <div key={l.title} className="flex items-center justify-between gap-6 py-4">
                <div>
                  <p className="text-lg font-semibold">{l.title}</p>
                  <p className="font-serif text-sm italic opacity-70">{l.note}</p>
                </div>
                <button className="shrink-0 rounded-full border border-ivory/40 px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-ivory/10">
                  Descargar
                </button>
              </div>
            ))}
          </div>
        </Section>

        <footer className="border-t border-ivory/15 px-6 py-10 text-center font-serif text-sm italic opacity-70">
          {church.name} · Mérida, Yucatán · <Link to="/" className="underline underline-offset-4 hover:opacity-70">Volver a todas las iglesias</Link>
        </footer>
      </div>
    </main>
  );
}

function Section({ id, roman, title, children }: { id: string; roman: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="reveal mx-auto max-w-6xl scroll-mt-10 px-6 py-20">
      <span className="font-serif text-sm opacity-70">{roman}</span>
      <h2 className="mb-10 mt-1 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-none tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
