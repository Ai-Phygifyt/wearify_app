// Shared customer-profile helpers used by /c/register, tablet/register,
// and /c/me/profile so the onboarding contract stays identical across
// surfaces (units, age rules, validation, avatar fallback).

export const MIN_HEIGHT_CM = 120;
export const MAX_HEIGHT_CM = 220;
export const MIN_AGE_YEARS = 13;
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type Gender = "female" | "male" | "other" | "prefer_not_to_say";
export type HeightUnit = "cm" | "ftin";

export function cmToFtIn(cm: number): { ft: number; inch: number } {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn - ft * 12);
  if (inch === 12) return { ft: ft + 1, inch: 0 };
  return { ft, inch };
}

export function ftInToCm(ft: number, inch: number): number {
  return Math.round((ft * 12 + inch) * 2.54);
}

export function clampHeightCm(n: number): number {
  return Math.min(MAX_HEIGHT_CM, Math.max(MIN_HEIGHT_CM, Math.round(n)));
}

export function ageFromDob(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
}

export function maxDobToday(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MIN_AGE_YEARS);
  return d.toISOString().split("T")[0];
}

export type ProfileValues = {
  fullName: string;
  dob: string;
  gender: Gender | "";
  heightCm: number;
  city: string;
  email: string;
};

/** Returns an error message, or empty string if valid. */
export function validateProfile(values: ProfileValues): string {
  if (!values.fullName.trim() || values.fullName.trim().length < 2)
    return "Enter your full name";
  if (!values.dob) return "Select your date of birth";
  const age = ageFromDob(values.dob);
  if (age === null) return "Enter a valid date of birth";
  if (age < MIN_AGE_YEARS) return `You must be at least ${MIN_AGE_YEARS} years old`;
  if (age > 120) return "Enter a valid date of birth";
  if (!values.gender) return "Select a gender";
  if (values.heightCm < MIN_HEIGHT_CM || values.heightCm > MAX_HEIGHT_CM)
    return `Height must be between ${MIN_HEIGHT_CM} and ${MAX_HEIGHT_CM} cm`;
  if (!values.city.trim()) return "Enter your city";
  if (
    values.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  )
    return "Enter a valid email (or leave blank)";
  return "";
}

export function validatePhoto(file: File): string {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type))
    return "Photo must be JPEG, PNG, or WebP";
  if (file.size > MAX_PHOTO_BYTES) return "Photo must be under 4 MB";
  return "";
}
