import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import placeholder from "@/assets/iglesia-placeholder.svg";

export type PublicChurchCard = {
  id: string;
  name: string;
  slug?: string;
  short?: string;
  founded?: string;
  image?: string;
};

interface ChurchCarouselProps {
  churches: readonly PublicChurchCard[];
  onOpen?: (slug: string) => void;
}

/** Two animated lanes for the public Supabase church directory. */
export function ChurchCarousel({ churches, onOpen }: ChurchCarouselProps) {
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const rowViewports = useRef<Array<HTMLDivElement | null>>([]);
  const rows: [PublicChurchCard[], PublicChurchCard[]] = [
    churches.filter((_, index) => index % 2 === 0),
    churches.filter((_, index) => index % 2 === 1),
  ];

  function moveRow(rowIndex: number, direction: -1 | 1) {
    rowViewports.current[rowIndex]?.scrollBy({ left: direction * 280, behavior: "smooth" });
  }

  if (churches.length === 0) {
    return (
      <p className="mx-auto mt-12 max-w-xl rounded-3xl border border-ink/15 px-6 py-12 text-center font-serif text-xl text-ink/70">
        No encontramos iglesias con esa búsqueda. Prueba con otro nombre.
      </p>
    );
  }

  return (
    <>
      <p
        className="mt-6 text-center text-xs uppercase tracking-[0.18em] text-ink/60"
        aria-live="polite"
      >
        {churches.length} {churches.length === 1 ? "iglesia encontrada" : "iglesias encontradas"}
      </p>
      <div
        className="serpent-window mx-auto mt-8 max-w-[100vw] space-y-5 py-4"
        aria-label="Directorio público de iglesias"
      >
        {rows.map(
          (row, rowIndex) =>
            row.length > 0 && (
              <div
                key={rowIndex}
                className={`serpent-row relative ${activeRow === rowIndex ? "serpent-row-active" : ""}`}
                onMouseEnter={() => setActiveRow(rowIndex)}
                onMouseLeave={() => setActiveRow(null)}
                onFocus={() => setActiveRow(rowIndex)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setActiveRow(null);
                  }
                }}
              >
                <div
                  ref={(element) => {
                    rowViewports.current[rowIndex] = element;
                  }}
                  className="serpent-viewport"
                >
                  <div
                    className={`serpent-track ${rowIndex === 1 ? "serpent-track-reverse" : ""} ${activeRow === rowIndex ? "serpent-track-paused" : ""}`}
                  >
                    {[0, 1].map((copy) => (
                      <div key={copy} className="serpent-group" aria-hidden={copy === 1}>
                        {row.map((church, index) => (
                          <ChurchCard
                            key={church.id}
                            church={church}
                            delay={(index + rowIndex) * 0.7}
                            {...(onOpen ? { onOpen } : {})}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className="serpent-controls"
                  aria-label={`Controles de la fila ${rowIndex + 1}`}
                >
                  <button
                    type="button"
                    onClick={() => moveRow(rowIndex, -1)}
                    aria-label={`Mover fila ${rowIndex + 1} a la izquierda`}
                    className="serpent-control-button"
                  >
                    <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRow(rowIndex, 1)}
                    aria-label={`Mover fila ${rowIndex + 1} a la derecha`}
                    className="serpent-control-button"
                  >
                    <ChevronRight aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ),
        )}
      </div>
    </>
  );
}

function ChurchCard({
  church,
  delay,
  onOpen,
}: {
  church: PublicChurchCard;
  delay: number;
  onOpen?: (slug: string) => void;
}) {
  const className =
    "float-card group relative block w-40 shrink-0 cursor-pointer overflow-hidden rounded-[2rem] shadow-xl transition-transform duration-500 hover:z-10 hover:scale-105 hover:shadow-2xl focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-old sm:w-48 md:w-52";
  const content = (
    <>
      <img
        src={church.image || placeholder}
        alt={church.name}
        width={1024}
        height={1280}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = placeholder;
        }}
        className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-left text-ivory">
        <p className="line-clamp-3 font-serif text-lg italic leading-tight">
          {church.short || church.name}
        </p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest opacity-80">
          {church.founded ? `desde ${church.founded}` : "Yucatán"}
        </p>
      </div>
    </>
  );

  if (church.slug && onOpen) {
    return (
      <button
        type="button"
        onClick={() => onOpen(church.slug!)}
        className={className}
        style={{ animationDelay: `${delay}s` }}
        aria-label={`Entrar a ${church.name}`}
      >
        {content}
      </button>
    );
  }

  return (
    <article
      aria-label={church.name}
      className={className.replace("cursor-pointer", "")}
      style={{ animationDelay: `${delay}s` }}
    >
      {content}
    </article>
  );
}
