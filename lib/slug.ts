export function getListingSlug(item: { id?: string; url?: string; name?: string; slug?: string }): string {
  if (item.slug && item.slug.trim()) {
    return item.slug.trim().toLowerCase();
  }

  if (item.url) {
    try {
      const normalized = /^https?:\/\//i.test(item.url.trim()) ? item.url.trim() : `https://${item.url.trim().replace(/^@/, '')}`;
      const host = new URL(normalized).hostname.toLowerCase().replace(/^www\./, '');
      if (host) {
        return host.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
    } catch {}
  }

  if (item.name) {
    const cleaned = item.name
      .toLowerCase()
      .trim()
      .replace(/https?:\/\//, '')
      .replace(/^www\./, '')
      .split(/[:\s/]+/)[0] // Take first word/domain if title contains slogan
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (cleaned) return cleaned;
  }

  return item.id || 'startup';
}
