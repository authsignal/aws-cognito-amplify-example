import { Authsignal } from "@authsignal/browser";

export const authsignal = new Authsignal({
  tenantId: import.meta.env.VITE_AUTHSIGNAL_TENANT_ID!,
  baseUrl: import.meta.env.VITE_AUTHSIGNAL_URL!,
});
