v50 SEO fix
- Dynamic canonical for valid detail pages: detail.html?id=<album-id>.
- Drops navigation-only parameters such as from=exhibition/from=archive from canonical.
- ID-less and unknown detail URLs are marked noindex,follow to avoid soft-404 indexing noise.
- OG URL, title and description are aligned with the canonical album URL.
- Added cache busting for albums-extra.js and detail-seo.js.
