export default function truncate(maxLength: number, str: string) {
  if (str.length < maxLength) return str;

  return str.slice(0, maxLength - 3) + "...";
}
