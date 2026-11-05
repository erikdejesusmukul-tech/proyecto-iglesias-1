import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Search } from "lucide-react";
import iglesia from "@/assets/iglesia.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { churches as localCatalog } from "@/models/churches";
import { ChurchCarousel } from "@/views/ChurchCarousel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Encuentra tu comunidad · Iglesias de Yucatán" },
      {
        name: "description",
        content:
          "Explora iglesias verificadas de Yucatán y encuentra una comunidad para compartir tu fe.",
      },
      { property: "og:title", content: "Encuentra tu comunidad · Iglesias de Yucatán" },
      {
        property: "og:description",
        content:
          "Explora iglesias verificadas de Yucatán y encuentra una comunidad para compartir tu fe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const chapters = [
  {
    n: "I",
    t: "Piedra",
    d: "Templos levantados con piedra de antiguas ciudades mayas, testigos de cinco siglos de historia.",
  },
  {
    n: "II",
    t: "Luz",
    d: "Cúpulas y vitrales que dejan caer una luz dorada sobre las naves durante todo el día.",
  },
  {
    n: "III",
    t: "Silencio",
    d: "Espacios de recogimiento en el corazón de los barrios de Mérida.",
  },
];

function Index() {
  const [y, setY] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState<string>("");
  const [directory, setDirectory] = useState<{ id: string; name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingChurches, setIsLoadingChurches] = useState(true);
  const [churchLoadError, setChurchLoadError] = useState(false);
  const [directoryAttempt, setDirectoryAttempt] = useState(0);
  const navigate = useNavigate();
  const { queryClient } = Route.useRouteContext();

  const filteredChurches = useMemo(() => {
    const search = searchTerm.trim().toLocaleLowerCase("es-MX");
    if (!search) return directory;
    return directory.filter((church) => church.name.toLocaleLowerCase("es-MX").includes(search));
  }, [directory, searchTerm]);

  const catalogByName = useMemo(
    () => new Map(localCatalog.map((church) => [church.name, church])),
    [],
  );
  const carouselChurches = useMemo(
    () =>
      filteredChurches.map((church) => {
        const details = catalogByName.get(church.name);
        return {
          id: church.id,
          name: church.name,
          ...(details?.slug ? { slug: details.slug } : {}),
          ...(details?.short ? { short: details.short } : {}),
          ...(details?.founded ? { founded: details.founded } : {}),
          ...(details?.image ? { image: details.image } : {}),
        };
      }),
    [catalogByName, filteredChurches],
  );

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

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadPublicChurches() {
      setIsLoadingChurches(true);
      setChurchLoadError(false);
      try {
        const { data, error } = await supabase
          .from("churches")
          .select("id, name")
          .order("name", { ascending: true });
        if (error) throw error;
        if (!cancelled) setDirectory(data ?? []);
      } catch {
        if (!cancelled) {
          setDirectory([]);
          setChurchLoadError(true);
        }
      } finally {
        if (!cancelled) setIsLoadingChurches(false);
      }
    }
    void loadPublicChurches();
    return () => {
      cancelled = true;
    };
  }, [directoryAttempt]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    setUser(null);
    setName("");
  }

  async function openChurch(slug: string) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await navigate({ to: "/iglesias/$slug", params: { slug } });
    } else {
      await navigate({ to: "/auth", search: { redirect: `/iglesias/${slug}` } });
    }
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
          <div className="flex gap-8">
            <span>
              Iglesias <span className="opacity-60">Mérida '26</span>
            </span>
            <span>Ediciones</span>
          </div>
          <div className="flex items-center gap-6">
            <span>merida.mx</span>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="font-serif italic opacity-90">
                  Hola{name ? `, ${name.split(" ")[0]}` : ""}
                </span>
                <button
                  onClick={handleSignOut}
                  className="rounded-full border border-ivory/40 px-4 py-1.5 transition-colors hover:bg-ivory/10"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-ivory px-4 py-1.5 text-ink transition-transform hover:scale-105"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </header>

        <div className="absolute left-6 top-16 text-2xl font-semibold leading-[0.95] tracking-tight">
          La
          <br />
          Edición <span className="font-serif italic font-normal">Sagr</span>ada
          <br />
          Yucatán
        </div>

        <div className="absolute bottom-4 left-6 font-serif text-xs leading-tight opacity-80">
          © Iglesias de Mérida
          <br />
          Aviso de privacidad
        </div>

        <div
          className="absolute left-[14%] top-[24%] max-w-5xl"
          style={{ transform: `translateY(${-y * 0.4}px)`, opacity: Math.max(0, 1 - y / 600) }}
        >
          <h1 className="text-[clamp(3.5rem,10vw,9rem)] font-bold leading-[0.95] tracking-[-0.04em]">
            Encuentra
            <br />
            tu <span className="font-serif italic font-normal">comunidad</span>
          </h1>
          <p className="mt-6 font-serif text-[clamp(1.4rem,3vw,2.5rem)] leading-[0.95] tracking-tight">
            <span className="text-[1.6em] italic">E</span>xplora iglesias verificadas y encuentra
            <br />
            un lugar para compartir tu fe.
          </p>
        </div>
      </section>

      <section className="bg-ink px-6 py-32">
        <p className="reveal mx-auto max-w-5xl font-serif text-[clamp(2rem,5vw,4.5rem)] leading-[1] tracking-tight">
          <span className="italic">Bienvenido</span> a las iglesias históricas de Mérida, el alma de
          sus barrios.
        </p>
        <div className="mx-auto mt-24 grid max-w-6xl gap-12 md:grid-cols-3">
          {chapters.map((c, i) => (
            <article
              key={c.n}
              className="reveal border-t border-ivory/30 pt-6"
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <span className="font-serif text-sm opacity-70">{c.n}</span>
              <h2 className="mt-2 text-5xl font-bold tracking-tight">{c.t}</h2>
              <p className="mt-4 font-serif text-xl leading-snug opacity-80">{c.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-parchment px-6 py-24 text-ink sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="reveal mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-old">
              Directorio de comunidades
            </p>
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] tracking-tight">
              Iglesias de <span className="italic">Yucatán</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-ink/65 sm:text-lg">
              Explora iglesias verificadas y encuentra un lugar para compartir tu fe y participar.
            </p>
          </div>

          <div className="reveal relative mx-auto mt-10 max-w-2xl">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink/45"
            />
            <Input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar una iglesia por nombre..."
              aria-label="Buscar una iglesia por nombre"
              className="h-14 rounded-2xl border-ink/15 bg-ivory pl-12 pr-4 text-base shadow-md shadow-ink/5 placeholder:text-ink/40 focus-visible:ring-rose-old"
            />
          </div>

          {isLoadingChurches ? (
            <div
              aria-label="Cargando iglesias"
              className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4"
            >
              {Array.from({ length: 8 }, (_, index) => (
                <Skeleton key={index} className="aspect-[4/5] w-full rounded-[2rem] bg-ink/10" />
              ))}
            </div>
          ) : churchLoadError ? (
            <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-ink/15 bg-ivory px-6 py-10 text-center text-ink">
              <p className="text-sm text-ink/65">No se pudo cargar el directorio de iglesias.</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDirectoryAttempt((attempt) => attempt + 1)}
                className="mt-4 border-ink/15 text-ink"
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <ChurchCarousel churches={carouselChurches} onOpen={openChurch} />
          )}
        </div>
      </section>
    </main>
  );
}
