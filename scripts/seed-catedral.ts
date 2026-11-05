import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_PASSWORD = "Catedral2026*";
const CHURCH_SLUG = "la-catedral";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Configúralas en el archivo .env antes de ejecutar este seeder.",
  );
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testUsers = [
  { email: "admin@catedral.com", fullName: "Administrador de La Catedral", role: "admin" },
  { email: "pastor@catedral.com", fullName: "Pastor de La Catedral", role: "pastor" },
  {
    email: "secretario@catedral.com",
    fullName: "Secretario de La Catedral",
    role: "secretario",
  },
  { email: "tesorero@catedral.com", fullName: "Tesorero de La Catedral", role: "tesorero" },
  {
    email: "coordinador@catedral.com",
    fullName: "Coordinador de La Catedral",
    role: "coordinador",
  },
] as const;

async function findAuthUserByEmail(email: string) {
  const usersPerPage = 1000;

  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: usersPerPage,
    });

    if (error) throw error;

    const existingUser = data.users.find((user) => user.email?.toLowerCase() === email);
    if (existingUser) return existingUser;
    if (data.users.length < usersPerPage) return null;
  }

  throw new Error("Se alcanzó el límite al buscar usuarios existentes en Supabase Auth.");
}

async function createOrResetAuthUser(email: string, fullName: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (!error && data.user) {
    console.log(`Usuario creado: ${email}`);
    return data.user;
  }

  const existingUser = await findAuthUserByEmail(email);
  if (!existingUser) {
    throw error ?? new Error(`Supabase no devolvió el usuario ${email}.`);
  }

  const { data: updatedData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    existingUser.id,
    {
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { ...existingUser.user_metadata, full_name: fullName },
    },
  );

  if (updateError) throw updateError;
  console.log(`Usuario existente actualizado: ${email}`);
  return updatedData.user;
}

async function seed() {
  const { data: church, error: churchError } = await supabaseAdmin
    .from("churches")
    .upsert(
      {
        name: "La Catedral",
        slug: CHURCH_SLUG,
        legal_registration_number: "CATE123456789",
        verification_status: "verified",
        verification_document_url: null,
        logo_url: null,
        contact_email: "admin@catedral.com",
        contact_phone: null,
        address: "Calle 60, Centro, Mérida, Yucatán, México",
        short: "La Catedral de San Ildefonso, corazón histórico y religioso de Mérida.",
        tagline: "Historia, fe y patrimonio en el centro de Mérida.",
        image: "/images/iglesias/catedral-san-ildefonso/fachada.jpg",
        founded: "Construida entre los siglos XVI y XVII; consagrada en 1598.",
        map_query: "Catedral de San Ildefonso, Mérida, Yucatán",
        history: [
          "La Catedral de San Ildefonso fue levantada en el siglo XVI en el centro de Mérida y es considerada una de las catedrales más antiguas de América continental.",
          "Su construcción utilizó piedra de antiguos edificios mayas y refleja la historia colonial y religiosa de la ciudad.",
        ],
        capillas: [],
        horarios: [],
        contacto: {
          address: "Calle 60, Centro, Mérida, Yucatán, México",
          phone: "",
          email: "admin@catedral.com",
        },
        objetos: [],
        eventos: [],
        libros: [],
        deleted_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (churchError) throw churchError;

  for (const testUser of testUsers) {
    const user = await createOrResetAuthUser(testUser.email, testUser.fullName);
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: user.id,
        church_id: church.id,
        role: testUser.role,
        full_name: testUser.fullName,
        avatar_url: null,
        deleted_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (profileError) {
      throw new Error(`No se pudo guardar el perfil de ${testUser.email}: ${profileError.message}`);
    }

    console.log(`Perfil asignado: ${testUser.email} → ${testUser.role}`);
  }

  console.log(`Seeder terminado. Iglesia La Catedral: ${church.id}`);
}

seed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Falló el seeder de La Catedral: ${message}`);
  process.exitCode = 1;
});
