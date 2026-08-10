/*
 * Full-album chapter start times.
 * Each array follows TRACK LIST order.
 * Album durations are used for the final track seek range.
 */
window.ALBUM_CHAPTERS = window.ALBUM_CHAPTERS || {
  "crown-of-jewel": ["0:00", "4:12", "8:41", "12:35", "17:23", "22:06"],
  "lune-noire": ["0:00", "3:54", "7:44", "11:58", "16:06", "19:19"],
  "hollow-salvation": ["0:00", "3:54", "7:33", "11:37", "15:14", "19:26"],
  "trace-of-perfume": ["0:00", "3:20", "6:52", "10:39", "14:11", "17:35"],
  "cathedral-of-masks": ["0:00", "4:43", "9:14", "13:27", "17:37", "21:36"],
  "black-coronation": ["0:00", "4:12", "8:46", "12:48", "16:57", "21:52"],
  "silent-sovereign": ["0:00", "4:08", "8:36", "12:22", "16:52", "21:08"],
  "vitia": ["0:00", "3:29", "8:28", "13:00", "17:23", "21:23"],
  "crimson-covenant": ["0:00", "4:14", "7:40", "11:07", "14:37", "18:45"],
  "dissonance-cry": ["0:00", "3:52", "7:27", "10:55", "14:43", "19:05"]
};

window.ALBUM_DURATIONS = window.ALBUM_DURATIONS || {
  "crown-of-jewel": "26:07",
  "lune-noire": "23:25",
  "hollow-salvation": "23:26",
  "trace-of-perfume": "21:32",
  "cathedral-of-masks": "25:51",
  "black-coronation": "26:52",
  "silent-sovereign": "25:34",
  "vitia": "26:01",
  "crimson-covenant": "22:12",
  "dissonance-cry": "22:17"
};

/* Full-album YouTube sources used by the detail player when album data has no URL yet. */
window.ALBUM_FULL_ALBUMS = window.ALBUM_FULL_ALBUMS || {
  "cathedral-of-masks": "https://youtu.be/190zXU1NQ0A",
  "black-coronation": "https://youtu.be/DB4BKi4cLQ4",
  "silent-sovereign": "https://youtu.be/gqBQATUx-iY",
  "vitia": "https://youtu.be/v_J0zMSEeO4",
  "crimson-covenant": "https://youtu.be/m1TjLxmg4mQ",
  "dissonance-cry": "https://youtu.be/ajS5hUj-HPY"
};
