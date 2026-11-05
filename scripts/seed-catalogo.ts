import { createClient } from "@supabase/supabase-js";
import { createServer } from "vite";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Agrégalas al archivo .env antes de ejecutar el seeder.",
  );
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

type CatalogChurch = {
  slug: string;
  name: string;
  short: string;
  tagline: string;
  image: string;
  founded: string;
  mapQuery: string;
  history: string[];
  capillas: { name: string; note: string }[];
  horarios: { day: string; hours: string }[];
  contacto: { address: string; phone: string; email: string };
  objetos: { name: string; note: string }[];
  eventos: { name: string; note: string }[];
  libros: { title: string; note: string }[];
};

async function seedCatalog() {
  // Vite resolves the catalog's @ aliases and its imported image assets.
  const vite = await createServer({
    configFile: "vite.config.ts",
    appType: "custom",
    logLevel: "error",
    server: { middlewareMode: true },
  });

  try {
    const catalogModule = (await vite.ssrLoadModule("/src/models/churches.ts")) as {
      churches: CatalogChurch[];
    };
    const catalog = catalogModule.churches;

    if (!Array.isArray(catalog) || catalog.length === 0) {
      throw new Error("No se encontró el catálogo de iglesias en src/models/churches.ts.");
    }

    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from("churches")
      .select("slug");

    if (existingError) {
      throw new Error(`No se pudieron consultar los slugs existentes: ${existingError.message}`);
    }

    const existingSlugs = new Set((existingRows ?? []).map((row) => row.slug));
    const catalogSlugs = new Set<string>();
    const records = catalog
      .filter((church) => {
        if (catalogSlugs.has(church.slug)) {
          throw new Error(`El catálogo contiene el slug duplicado "${church.slug}".`);
        }
        catalogSlugs.add(church.slug);
        return !existingSlugs.has(church.slug);
      })
      .map((church) => ({
        slug: church.slug,
        name: church.name,
        short: church.short,
        tagline: church.tagline,
        image: church.image,
        founded: church.founded,
        map_query: church.mapQuery,
        history: church.history,
        capillas: church.capillas,
        horarios: church.horarios,
        contacto: church.contacto,
        objetos: church.objetos,
        eventos: church.eventos,
        libros: church.libros,
        address: church.contacto.address || null,
        contact_phone:
          church.contacto.phone && church.contacto.phone !== "No publicado"
            ? church.contacto.phone
            : null,
        contact_email:
          church.contacto.email && church.contacto.email !== "No publicado"
            ? church.contacto.email
            : null,
        // These are directory records, not claims that a church administrator
        // completed Supabase's institutional verification workflow.
        verification_status: "unverified" as const,
        deleted_at: null,
      }));

    if (records.length === 0) {
      console.log(`No se insertaron filas: las ${catalog.length} iglesias del catálogo ya existen.`);
      return;
    }

    const { data: insertedRows, error: insertError } = await supabaseAdmin
      .from("churches")
      .insert(records)
      .select("slug");

    if (insertError) {
      throw new Error(`Falló el insert masivo del catálogo: ${insertError.message}`);
    }

    console.log(`Iglesias insertadas correctamente: ${insertedRows?.length ?? records.length}.`);
    console.log(`Iglesias ya existentes omitidas: ${catalog.length - records.length}.`);
  } finally {
    await vite.close();
  }
}

seedCatalog().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Falló el seeder del catálogo: ${message}`);
  process.exitCode = 1;
});
