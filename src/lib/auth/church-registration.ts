import { supabase } from "@/integrations/supabase/client";

export type ChurchRegistrationPayload = {
  churchName: string;
  legalId: string;
  adminName: string;
  adminEmail: string;
};

const PENDING_REGISTRATION_KEY = "pending-church-registration";

function makeChurchSlug(name: string) {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 150)
    .replace(/-$/g, "");

  return `${base || "iglesia"}-${crypto.randomUUID().slice(0, 8)}`;
}

export function savePendingChurchRegistration(payload: ChurchRegistrationPayload) {
  localStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(payload));
}

export function getPendingChurchRegistration(): ChurchRegistrationPayload | null {
  const serialized = localStorage.getItem(PENDING_REGISTRATION_KEY);
  if (!serialized) return null;

  try {
    const value: unknown = JSON.parse(serialized);
    if (
      typeof value === "object" &&
      value !== null &&
      "churchName" in value &&
      typeof value.churchName === "string" &&
      "legalId" in value &&
      typeof value.legalId === "string" &&
      "adminName" in value &&
      typeof value.adminName === "string" &&
      "adminEmail" in value &&
      typeof value.adminEmail === "string"
    ) {
      return {
        churchName: value.churchName,
        legalId: value.legalId,
        adminName: value.adminName,
        adminEmail: value.adminEmail,
      };
    }
  } catch {
    // Discard malformed local data so it cannot block future registrations.
  }

  localStorage.removeItem(PENDING_REGISTRATION_KEY);
  return null;
}

export function clearPendingChurchRegistration() {
  localStorage.removeItem(PENDING_REGISTRATION_KEY);
}

export async function registerChurchForCurrentUser(payload: ChurchRegistrationPayload) {
  const { data, error } = await supabase.rpc("register_church", {
    p_name: payload.churchName,
    p_slug: makeChurchSlug(payload.churchName),
    p_legal_registration_number: payload.legalId,
    p_contact_email: payload.adminEmail,
    p_contact_phone: null,
    p_address: null,
    p_verification_document_url: null,
  });

  if (error) throw error;
  clearPendingChurchRegistration();
  return data;
}

let pendingCompletion: Promise<"completed" | "none" | "different-user"> | null = null;

export function completePendingChurchRegistration(
  authenticatedEmail: string | undefined,
): Promise<"completed" | "none" | "different-user"> {
  if (pendingCompletion) return pendingCompletion;

  const pending = getPendingChurchRegistration();
  if (!pending) return Promise.resolve("none");
  if (pending.adminEmail.toLowerCase() !== authenticatedEmail?.toLowerCase()) {
    return Promise.resolve("different-user");
  }

  pendingCompletion = registerChurchForCurrentUser(pending)
    .then(() => "completed" as const)
    .finally(() => {
      pendingCompletion = null;
    });

  return pendingCompletion;
}
