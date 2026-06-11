/** Deterministic 5-letter referral code derived from the customer id. */
export function makeCode(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < 5; i++) {
    s += A[h % 26];
    h = Math.floor(h / 26) + id.charCodeAt(i % id.length);
  }
  return s;
}
