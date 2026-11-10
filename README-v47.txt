Official Gallery v47

Fixes dead track playback controls when a YouTube full-album film is linked but chapter start times are not configured.

Behavior:
- If chapter timestamps exist, the original per-track chapter player is used unchanged.
- If chapter timestamps are missing, the track play button remains usable and toggles the linked full-album YouTube film.
- The time display shows FULL ALBUM instead of -- / --.
- Seek bars stay disabled in fallback mode because exact track boundaries are unknown.

This preserves the five YouTube links added in v46.
