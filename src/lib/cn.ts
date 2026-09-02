// Hilfsfunktion zum bedingten Zusammenführen von Tailwind-Klassen.
// Bewusst ohne externe Abhängigkeit (kein clsx/twMerge nötig im MVP).
export type ClassValue = string | number | null | false | undefined | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (v: ClassValue) => {
    if (!v && v !== 0) return;
    if (Array.isArray(v)) {
      v.forEach(walk);
      return;
    }
    out.push(String(v));
  };
  inputs.forEach(walk);
  return out.join(" ");
}
