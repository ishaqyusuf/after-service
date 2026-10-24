// SEO titles carry a "| afterservice" suffix that visible headings omit.
export function pageTitle(title: string) {
  return title.replace(" | afterservice", "");
}
