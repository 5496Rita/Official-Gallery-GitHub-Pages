(function () {
  var SITE_DETAIL = "https://5496rita.github.io/Official-Gallery-GitHub-Pages/detail.html";
  var params = new URLSearchParams(location.search);
  var id = (params.get("id") || "").trim();
  var robots = document.querySelector('meta[name="robots"]');
  var canonical = document.getElementById("canonical-url");
  var ogUrl = document.getElementById("og-url");

  function setCanonical(url) {
    if (canonical) canonical.href = url;
    if (ogUrl) ogUrl.content = url;
  }
  function setRobots(value) {
    if (robots) robots.content = value;
  }

  if (!id) {
    setCanonical(SITE_DETAIL);
    setRobots("noindex, follow, max-image-preview:large");
    return;
  }

  var list = Array.isArray(window.GALLERY_ALBUMS) ? window.GALLERY_ALBUMS : [];
  var album = list.find(function (item) { return item && item.id === id; });

  if (!album) {
    setCanonical(SITE_DETAIL);
    setRobots("noindex, follow, max-image-preview:large");
    return;
  }

  var cleanUrl = SITE_DETAIL + "?id=" + encodeURIComponent(id);
  setCanonical(cleanUrl);
  setRobots("index, follow, max-image-preview:large");

  var desc = document.getElementById("meta-description");
  var ogTitle = document.getElementById("og-title");
  var ogDescription = document.getElementById("og-description");
  var twitterTitle = document.getElementById("twitter-title");
  var twitterDescription = document.getElementById("twitter-description");
  var storyText = Array.isArray(album.story) ? album.story.join(" ").replace(/\s+/g, " ").trim() : "";
  var description = storyText ? storyText.slice(0, 155) : album.title + " — 越黒リタ Official Gallery";
  var title = album.title + " — 越黒リタ Official Gallery";

  if (desc) desc.content = description;
  if (ogTitle) ogTitle.content = title;
  if (ogDescription) ogDescription.content = description;
  if (twitterTitle) twitterTitle.content = title;
  if (twitterDescription) twitterDescription.content = description;
  document.title = title;
})();
