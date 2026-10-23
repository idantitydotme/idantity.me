import { type Component } from "solid-js";

export const Turnstile: Component = () => {
  const siteKey =
    (import.meta as any).env?.["VITE_TURNSTILE_SITE_KEY"] ||
    (import.meta as any).env?.["TURNSTILE_SITE_KEY"] ||
    "";

  if (!siteKey) return null;

  return <div class="cf-turnstile my-2" data-sitekey={siteKey} />;
};

export default Turnstile;
