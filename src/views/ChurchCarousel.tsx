import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { searchChurches, splitChurchRows } from "@/controllers/churchController";
import type { Church } from "@/models/churches";

interface ChurchCarouselProps {
  churches: readonly Church[];
  onOpen: (slug: string) => void;
}

/** View for the searchable, two-row church catalogue. */
export function ChurchCarousel({ churches, onOpen }: ChurchCarouselProps) {
  const [search, setSearch] = useState("");
  const filteredChurches = useMemo(() => searchChurches(churches, search), [churches, search]);
  const rows = splitChurchRows(filteredChurches);

  return (
    <>
      <div className="mx-auto mt-12 max-w-7xl">
        <label htmlFor="church-search" className="sr-only">Buscar por nombre, historia o ubicación</label>
        <div className="mx-auto flex max-w-xl items-center gap-3 rounded-full border border-ink/20 bg-ivory/60 px-5 py-3 shadow-sm transition focus-within:border-rose-old focus-within:ring-2 focus-within:ring-rose-old/30">
          <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-ink/60" />
          <input id="church-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busca un templo, barrio o estilo…" className="min-w-0 flex-1 bg-transparent font-serif text-lg text-ink outline-none placeholder:text-ink/50" />
          {search && <button type="button" onClick={() => setSearch("")} aria-label="Limpiar búsqueda" className="rounded-full p-1 text-ink/60 transition hover:bg-ink/10 hover:text-ink"><X className="h-4 w-4" /></button>}
        </div>
        <p className="mt-3 text-center text-xs uppercase tracking-[0.18em] text-ink/60" aria-live="polite">{filteredChurches.length} {filteredChurches.length === 1 ? "templo encontrado" : "templos encontrados"}</p>
      </div>
      {filteredChurches.length ? (
        <div className="serpent-window mx-auto mt-10 max-w-[100vw] space-y-5 py-4" aria-label="Iglesias históricas de Mérida">
          {rows.map((row, rowIndex) => row.length > 0 && (
            <div key={`${rowIndex}-${search ? "search" : "all"}`} className={`serpent-track ${rowIndex === 1 ? "serpent-track-reverse" : ""}`}>
              {[0, 1].map((copy) => (
                <div key={copy} className="serpent-group" aria-hidden={copy === 1}>
                  {row.map((church, index) => (
                    <button key={church.slug} onClick={() => onOpen(church.slug)} className="float-card group relative w-40 shrink-0 cursor-pointer overflow-hidden rounded-[2rem] shadow-xl transition-transform duration-500 hover:z-10 hover:scale-105 hover:shadow-2xl focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-old sm:w-48 md:w-52" style={{ animationDelay: `${(index + rowIndex) * 0.7}s` }} aria-label={`Entrar a ${church.name}`} tabIndex={copy === 0 ? 0 : -1}>
                      <img src={church.image} alt={church.name} width={1024} height={1280} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-left text-ivory"><p className="font-serif text-lg italic leading-tight">{church.short}</p><p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">desde {church.founded}</p></div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="mx-auto mt-12 max-w-xl rounded-3xl border border-ink/15 px-6 py-12 text-center font-serif text-xl text-ink/70">No encontramos templos con esa búsqueda. Prueba con otro nombre o barrio.</p>
      )}
    </>
  );
}
