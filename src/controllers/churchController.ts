import type { Church } from "@/models/churches";

/** Application rules for finding and arranging church records. */
export function searchChurches(churches: readonly Church[], search: string): Church[] {
  const query = normalize(search);
  if (!query) return [...churches];

  return churches.filter((church) =>
    normalize([
      church.name,
      church.short,
      church.tagline,
      church.founded,
      church.mapQuery,
      church.contacto.address,
      ...church.history,
      ...church.objetos.map((item) => `${item.name} ${item.note}`),
    ].join(" ")).includes(query),
  );
}

export function splitChurchRows(churches: readonly Church[]): [Church[], Church[]] {
  return [
    churches.filter((_, index) => index % 2 === 0),
    churches.filter((_, index) => index % 2 === 1),
  ];
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
