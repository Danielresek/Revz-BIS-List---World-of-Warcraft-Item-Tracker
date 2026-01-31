// csrf.js - small helper to read CSRF token from meta tag
export function getCsrf() {
  return (
    document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content") || null
  );
}
