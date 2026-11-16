v65 ROOT FIX

原因:
- live site albums-lite.js exposes `albums` as a global lexical binding.
- v61-v64 release-gate.js and detail alias repair checked only window.albums.
- Therefore release gating and ID repair could silently skip entirely.

Fix:
- release-gate.js now reads bare `albums` first, then mirrors it to window.albums.
- Detail ID repair does the same and can match by id/title/reading normalization.
- Future unregistered works now render UNREGISTERED instead of detail.js's default COMING SOON placeholder.
- Legacy Cathedral of Masks links are repaired before detail.js resolves the album.
- release-gate cache bumped to v6500.
