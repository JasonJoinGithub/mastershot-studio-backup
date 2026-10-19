const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function createCard(project) {
  const card = document.createElement("article");
  card.className = "work-card";
  card.dataset.tags = project.tags.join(" ");
  card.dataset.id = project.id;
  card.innerHTML = `<img src="${project.poster}" alt="${project.title} 海报" loading="lazy"><div class="card-preview" aria-hidden="true"><div class="card-preview-media"><img src="${project.poster}" alt=""></div><button class="card-preview-play" type="button" aria-label="播放 ${project.title}">▶</button><span class="card-preview-label">PREVIEW / 预览</span></div><button class="play-hint" type="button">${project.trailer ? "▶ 预告片" : "项目详情"}</button><div class="work-card-content"><span class="type">${project.type}</span><h3>${project.title}</h3><p>${project.director ? `导演：${project.director} · ` : ""}${project.year}</p><p class="role">${project.role}</p></div>`;
  card.querySelector(".play-hint")?.addEventListener("click", event => {
    event.stopPropagation();
    project.trailer ? openPlayback(project, card) : openProject(project, card);
  });
  card.querySelector(".card-preview-play")?.addEventListener("click", event => {
    event.stopPropagation();
    project.trailer ? openPlayback(project, card) : openProject(project, card);
  });
  let previewTimer;
  card.addEventListener("pointerenter", () => {
    if (!project.trailer) return;
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(() => showCardPreview(card, project), 2000);
  });
  card.addEventListener("pointerleave", () => {
    window.clearTimeout(previewTimer);
    hideCardPreview(card);
  });
  card.addEventListener("click", () => openProject(project, card));
  return card;
}

function showCardPreview(card, project) {
  const media = card.querySelector(".card-preview-media");
  if (!media) return;
  const embed = youtubeEmbed(project.trailer, { autoplay:1, mute:1, controls:0 });
  if (embed) {
    media.innerHTML = `<iframe src="${embed}" title="${project.title} 预览" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  } else if (project.trailer && /\.(mp4|webm|ogg)(\?|$)/i.test(project.trailer)) {
    media.innerHTML = `<video src="${project.trailer}" muted loop autoplay playsinline poster="${project.poster}"></video>`;
  }
  card.classList.add("is-previewing");
}

function hideCardPreview(card) {
  const media = card.querySelector(".card-preview-media");
  if (!media) return;
  card.classList.remove("is-previewing");
  window.setTimeout(() => {
    if (!card.matches(":hover")) media.innerHTML = `<img src="${card.querySelector("img")?.src || ""}" alt="">`;
  }, 260);
}

let playbackState = { scrollY:0, activeElement:null, projects:[], index:0, projectViewOpen:false, projectViewScroll:0 };

function openPlayback(project, returnCard = null) {
  const modal = $("#trailer-modal");
  playbackState = {
    scrollY:window.scrollY,
    activeElement:returnCard || document.activeElement,
    projects:SITE.projects.filter(item => item.trailer || item.poster),
    index:0,
    projectViewOpen:$("#project-view").classList.contains("is-open"),
    projectViewScroll:$("#project-view-scroll").scrollTop
  };
  playbackState.index = Math.max(0, playbackState.projects.findIndex(item => item.id === project.id));
  renderPlayback(project);
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("trailer-open");
}

function renderPlayback(project) {
  const frame = $("#trailer-modal-frame");
  const embed = youtubeEmbed(project.trailer, { autoplay:1, controls:1 });
  const youtubeSource = /(?:youtube\.com|youtu\.be)/i.test(project.trailer || "");
  frame.innerHTML = embed
    ? `<iframe class="player-frame" src="${embed}" title="${project.title} 预告片" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>`
    : youtubeSource
      ? externalPlaybackMarkup(project)
    : project.trailer && /\.(mp4|webm|ogg)(\?|$)/i.test(project.trailer)
      ? `<video src="${project.trailer}" controls autoplay playsinline poster="${project.poster}"></video>`
      : `<div class="playback-poster"><img src="${project.poster}" alt="${project.title} 海报"><span>该项目暂无可播放片段</span></div>`;
  primePlayerSurface(frame, project);
  $("#trailer-modal-title").textContent = project.title;
  $("#trailer-modal-meta").textContent = `${project.type} / ${project.year}`;
}

function externalPlaybackMarkup(project) {
  return `<div class="playback-external"><img src="${project.poster}" alt="${project.title} 预告片封面"><div class="playback-external-copy"><span>LOCAL FILE PREVIEW / 本地预览模式</span><p>浏览器以 file:// 打开时，YouTube 不允许嵌入播放。</p><a href="${project.trailer}" target="_blank" rel="noopener noreferrer">在 YouTube 播放 ↗</a></div></div>`;
}

function inlineTrailerMarkup(project) {
  const embed = youtubeEmbed(project.trailer, { autoplay:1, controls:1 });
  if (embed) return `<iframe class="player-frame" src="${embed}" title="${project.title} 预告片" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe><button class="project-trailer-close" type="button" aria-label="退出播放">X</button>`;
  if (project.trailer && /\.(mp4|webm|ogg)(\?|$)/i.test(project.trailer)) return `<video src="${project.trailer}" controls autoplay playsinline poster="${project.poster}"></video>`;
  if (/(?:youtube\.com|youtu\.be)/i.test(project.trailer || "")) return externalPlaybackMarkup(project);
  return `<div class="playback-poster"><img src="${project.poster}" alt="${project.title} 海报"><span>该项目暂无可播放片段</span></div>`;
}

function playProjectTrailerInline(project, container) {
  if (!container) return;
  container.classList.add("is-playing");
  container.innerHTML = inlineTrailerMarkup(project);
  primePlayerSurface(container, project);
  container.querySelector(".project-trailer-close")?.addEventListener("click", event => {
    event.stopPropagation();
    closeProject();
  });
}

function primePlayerSurface(container, project) {
  if (!container) return;
  const poster = project?.trailerPoster || project?.still || project?.poster;
  if (poster) container.style.setProperty("--player-poster", `url("${poster}")`);
  container.classList.add("player-loading");
  const iframe = $("iframe.player-frame", container);
  if (!iframe) {
    container.classList.remove("player-loading");
    return;
  }
  const reveal = () => container.classList.remove("player-loading");
  // The iframe document can finish loading before Bilibili has painted its
  // first frame. Keep the local poster up during that short hand-off so the
  // user never sees an empty black canvas.
  iframe.addEventListener("load", () => window.setTimeout(reveal, 1800), { once:true });
  window.setTimeout(reveal, 5000);
}

function closePlayback() {
  const modal = $("#trailer-modal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  const frame = $("#trailer-modal-frame");
  frame.innerHTML = "";
  frame.classList.remove("player-loading");
  frame.style.removeProperty("--player-poster");
  document.body.classList.remove("trailer-open");
  if (playbackState.projectViewOpen) {
    $("#project-view-scroll").scrollTop = playbackState.projectViewScroll;
  } else {
    window.scrollTo({ top:playbackState.scrollY, behavior:"instant" });
  }
  if (playbackState.activeElement && typeof playbackState.activeElement.focus === "function") playbackState.activeElement.focus({ preventScroll:true });
}

function stepPlayback(direction) {
  if (!playbackState.projects.length) return;
  playbackState.index = (playbackState.index + direction + playbackState.projects.length) % playbackState.projects.length;
  renderPlayback(playbackState.projects[playbackState.index]);
}

function renderProjects(filter = "all") {
  const grid = $("#work-grid");
  grid.innerHTML = "";
  SITE.projects.filter(project => filter === "all" || project.tags.includes(filter)).forEach(project => grid.appendChild(createCard(project)));
}

function youtubeEmbed(url, options = {}) {
  if (!url) return "";
  const autoplay = options.autoplay ? 1 : 0;
  const mute = options.mute ? 1 : 0;
  const controls = options.controls === 0 ? 0 : 1;
  const localFile = window.location.protocol === "file:";
  // Local file previews do not send an HTTP referrer, which can trigger
  // YouTube error 153. A stable origin keeps the iframe configuration valid.
  const origin = window.location.protocol === "file:" ? "https://www.youtube.com" : window.location.origin;
  const params = new URLSearchParams({ autoplay, mute, controls, rel:0, modestbranding:1, playsinline:1, origin, enablejsapi:1 });
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/i);
  if (youtube) return localFile ? "" : `https://www.youtube.com/embed/${youtube[1]}?${params.toString()}`;
  const playlist = url.match(/[?&]list=([\w-]+)/i);
  if (playlist) return localFile ? "" : `https://www.youtube.com/embed/videoseries?list=${playlist[1]}&${params.toString()}`;
  const bilibili = url.match(/bilibili\.com\/video\/(BV[\w]+)/i);
  if (bilibili) {
    // Use Bilibili's standard embedded player for reliable iframe rendering.
    // Keep only the BV id so shared-link t= values never seek into the video.
    const params = new URLSearchParams({
      bvid: bilibili[1],
      page: "1",
      autoplay: String(autoplay),
      t: "0",
      start_progress: "0",
      time: "0",
      high_quality: "1",
      quality: "112",
      qn: "112",
      fourk: "1",
      as_wide: "1",
      danmaku: "0",
      enablejsapi: "1"
    });
    return `https://player.bilibili.com/player.html?${params.toString()}`;
  }
  return "";
}

function bilibiliId(url = "") {
  return url.match(/bilibili\.com\/video\/(BV[\w]+)/i)?.[1] || "";
}

async function hydrateTrailerCover(project, container) {
  const bvid = bilibiliId(project.trailer);
  const image = $(".trailer-poster-image", container);
  if (!bvid || !image) return;
  image.addEventListener("error", () => {
    image.src = project.still || project.poster;
  }, { once:true });
  try {
    const response = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, { mode:"cors" });
    if (!response.ok) return;
    const payload = await response.json();
    const frame = payload?.data?.pages?.[0]?.first_frame || payload?.data?.pic;
    if (frame) image.src = frame.replace(/^http:/, "https:");
  } catch (error) {
    // The local poster remains as a reliable fallback when the metadata API is unavailable.
  }
}

function projectTrailer(project) {
  // Start with a visible trailer frame; the player is created only after click.
  // This prevents the black loading state while keeping playback in this page.
  const embed = youtubeEmbed(project.trailer, { controls:1 });
  if (embed) {
    const poster = project.trailerPoster || project.still || project.poster;
    return `<div class="project-trailer project-trailer-poster"><img class="trailer-poster-image" src="${poster}" alt="${project.title} 预告片画面" loading="eager"><button type="button" class="trailer-play detail-play" data-playback="${encodeURIComponent(project.id)}" aria-label="播放 ${project.title}">▷</button></div>`;
  }
  if (project.trailer && /\.(mp4|webm|ogg)(\?|$)/i.test(project.trailer)) return `<div class="project-trailer"><video src="${project.trailer}" controls playsinline poster="${project.poster}"></video><span class="trailer-caption">PLAY TRAILER / 预告片</span></div>`;
  if (project.trailer && /(?:youtube\.com|youtu\.be)/i.test(project.trailer)) return `<div class="project-trailer project-trailer-poster"><img src="${project.poster}" alt="${project.title} 预告片封面"><button type="button" class="trailer-play detail-play" data-playback="${encodeURIComponent(project.id)}" aria-label="播放 ${project.title}">▷</button><span class="trailer-caption">PLAY TRAILER / 播放预告片</span></div>`;
  if (project.trailerPage && !project.trailer) return `<div class="project-trailer project-trailer-poster"><img src="${project.poster}" alt="${project.title} 官方页面封面"><a class="trailer-play detail-external-link official-link" href="${project.trailerPage}" target="_blank" rel="noopener noreferrer" aria-label="打开 ${project.title} 官方页面">↗</a><span class="trailer-caption">OPEN OFFICIAL PAGE / 打开官方页面</span></div>`;
  if (project.trailerPage) return `<div class="project-trailer project-trailer-poster"><img src="${project.poster}" alt="${project.title} 预告片封面"><button type="button" class="trailer-play detail-play" data-playback="${encodeURIComponent(project.id)}" aria-label="播放 ${project.title}">▷</button><span class="trailer-caption">PLAY TRAILER / 播放预告片</span></div>`;
  return `<div class="project-trailer project-trailer-poster"><img src="${project.poster}" alt="${project.title} 海报"><span class="trailer-wait">预告片链接待补充</span></div>`;
}

function openProject(project, returnCard = null) {
  const view = $("#project-view");
  const shots = project.stills?.length ? project.stills : [project.still || project.poster];
  const gallery = shots.map((src, index) => `<figure><img src="${src}" alt="${project.title} 剧照 ${index + 1}" loading="lazy"></figure>`).join("");
  $("#project-view-content").innerHTML = `<article class="project-detail"><div class="project-detail-hero"><div class="project-detail-media">${projectTrailer(project)}</div><div class="project-detail-title"><span class="eyebrow">${project.type} / ${project.year}</span><h1>${project.title}</h1><p>${project.director ? `导演 / ${project.director}` : ""}</p><p class="project-detail-role">${project.role}</p></div></div><div class="project-detail-copy"><div class="project-detail-description"><p>${project.description}</p><div class="project-detail-meta"><span>${project.role}</span><span>${project.year}</span><span>Mastershot Studio</span></div></div></div><div class="project-gallery">${gallery}</div></article>`;
  const detailPlay = $(".detail-play", $("#project-view-content"));
  detailPlay?.addEventListener("click", event => { event.stopPropagation(); playProjectTrailerInline(project, detailPlay.closest(".project-trailer")); });
  hydrateTrailerCover(project, detailPlay?.closest(".project-trailer"));
  view.classList.add("is-open");
  view.setAttribute("aria-hidden", "false");
  $("#project-view-scroll").scrollTop = 0;
  document.body.classList.add("project-open");
  history.pushState({ project: project.id }, "", `#project-${encodeURIComponent(project.id)}`);
  requestProgressUpdate();
}

function closeProject() {
  if ($("#trailer-modal")?.classList.contains("is-open")) closePlayback();
  const view = $("#project-view");
  view.classList.remove("is-open");
  view.setAttribute("aria-hidden", "true");
  document.body.classList.remove("project-open");
  // Remove the detail DOM after leaving the page so an inline iframe/video
  // cannot keep playing while the project view is hidden.
  const projectContent = $("#project-view-content");
  if (projectContent) projectContent.replaceChildren();
  if (location.hash.startsWith("#project-")) history.pushState({}, "", "#work");
  requestProgressUpdate();
}

const progressBar = $("#page-progress-bar");
let progressFrame = 0;
function updatePageProgress() {
  if (!progressBar) return;
  const projectView = $("#project-view");
  const projectScroller = $("#project-view-scroll");
  const detailOpen = projectView?.classList.contains("is-open");
  const top = detailOpen ? projectScroller.scrollTop : window.scrollY;
  const max = detailOpen ? projectScroller.scrollHeight - projectScroller.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? Math.min(1, top / max) : 0})`;
  progressFrame = 0;
}
function requestProgressUpdate() {
  if (!progressBar || progressFrame) return;
  progressFrame = window.requestAnimationFrame(updatePageProgress);
}

$("#hero-backdrop").style.backgroundImage = `url("${SITE.heroImage}")`;
document.documentElement.style.setProperty("--wordmark-image", `url("${SITE.heroImage}")`);
if (SITE.heroVideo) {
  const heroVideo = $("#hero-motion");
  heroVideo.src = SITE.heroVideo;
  heroVideo.classList.add("is-active");
  heroVideo.play().catch(() => {});
}
renderProjects();
SITE.otherProjects.forEach(project => $("#other-grid").appendChild(createCard(project)));
$("#trilogy-grid").innerHTML = SITE.trilogy.map(item => `<article class="trilogy-card" style="--image:url('${item.image}')"><div><span class="card-no">${item.number}</span><h3>${item.title}</h3></div><div><p>${item.text}</p><span class="text-link">VIEW PROJECT <span>↘</span></span></div></article>`).join("");
$$('.trilogy-card').forEach(card => card.style.setProperty('--card-image', card.style.getPropertyValue('--image')));
document.querySelectorAll('.trilogy-card').forEach(card => { card.style.setProperty('background-image', `var(--image)`); });
document.querySelectorAll('.trilogy-card').forEach(card => { const image = card.style.getPropertyValue('--image'); card.style.background = `linear-gradient(0deg,rgba(12,13,13,.92),rgba(12,13,13,.1)),${image}`; card.style.backgroundSize = 'cover'; card.style.backgroundPosition = 'center'; });

$$('.filter').forEach(button => button.addEventListener('click', () => { $$('.filter').forEach(item => item.classList.remove('is-active')); button.classList.add('is-active'); renderProjects(button.dataset.filter); }));
$("#project-home").addEventListener("click", closeProject);
$(".project-logo").addEventListener("click", event => { event.preventDefault(); closeProject(); window.scrollTo({ top: 0, behavior: "smooth" }); });
window.addEventListener("scroll", requestProgressUpdate, { passive:true });
window.addEventListener("resize", requestProgressUpdate);
$("#project-view-scroll").addEventListener("scroll", requestProgressUpdate, { passive:true });
requestProgressUpdate();
$("#trailer-modal-close").addEventListener("click", closePlayback);
$("#trailer-modal-prev").addEventListener("click", () => stepPlayback(-1));
$("#trailer-modal-next").addEventListener("click", () => stepPlayback(1));
$("#trailer-modal").addEventListener("click", event => { if (event.target.id === "trailer-modal") closePlayback(); });
window.addEventListener("popstate", () => { if (!location.hash.startsWith("#project-")) closeProject(); });
window.addEventListener("message", event => {
  if (!/bilibili\.com$/i.test(event.origin || "")) return;
  // Bilibili has used several message shapes across player versions. Keep the
  // check tolerant, while ignoring messages from another iframe.
  const activeFrame = $("#trailer-modal-frame iframe.player-frame") || $("#project-view-content iframe.player-frame");
  if (activeFrame && event.source && event.source !== activeFrame.contentWindow) return;
  let payload = event.data;
  if (typeof payload === "string") {
    try { payload = JSON.parse(payload); } catch (_) { payload = { event: payload }; }
  }
  const signals = [
    payload?.event,
    payload?.type,
    payload?.msg,
    payload?.status,
    payload?.data?.event,
    payload?.data?.type,
    payload?.data?.msg,
    payload?.data?.status
  ].filter(Boolean).map(value => String(value).toLowerCase());
  if (!signals.some(signal => /ended|video[_-]?end|play[_-]?end|finish(?:ed)?/.test(signal))) return;
  if ($("#trailer-modal")?.classList.contains("is-open")) closePlayback();
  else if ($("#project-view")?.classList.contains("is-open")) closeProject();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if ($("#project-view").classList.contains("is-open")) closeProject();
    if ($("#trailer-modal").classList.contains("is-open")) closePlayback();
  }
  if ($("#trailer-modal").classList.contains("is-open")) {
    if (event.key === "ArrowLeft") stepPlayback(-1);
    if (event.key === "ArrowRight") stepPlayback(1);
  }
});
$("#year").textContent = new Date().getFullYear();

const toggle = $(".menu-toggle");
toggle.addEventListener("click", () => { const open = toggle.getAttribute("aria-expanded") === "true"; toggle.setAttribute("aria-expanded", String(!open)); document.body.classList.toggle("nav-open", !open); });
$(".brand").addEventListener("click", event => { event.preventDefault(); toggle.setAttribute("aria-expanded", "false"); document.body.classList.remove("nav-open"); window.scrollTo({ top: 0, behavior: "smooth" }); });
$$(".main-nav a").forEach(link => link.addEventListener("click", () => { toggle.setAttribute("aria-expanded", "false"); document.body.classList.remove("nav-open"); }));
const navPreviewImage = $("#nav-preview-image");
const navPreviewLabel = $("#nav-preview-label");
const navPreviewNames = { HOME:"MASTER SHOT / 首页", WORK:"SELECTED WORK / 代表作品", APPROACH:"EDITORIAL APPROACH / 创作方法", ABOUT:"LI JIAWEI / 关于李嘉伟", CONTACT:"CONTACT / 合作联系" };
$$('.nav-links a').forEach(link => {
  const preview = () => {
    navPreviewImage.src = link.dataset.preview;
    navPreviewImage.alt = navPreviewNames[link.textContent.trim()] || link.textContent.trim();
    navPreviewLabel.textContent = navPreviewNames[link.textContent.trim()] || "SELECTED WORK";
  };
  link.addEventListener("pointerenter", preview);
  link.addEventListener("focus", preview);
});

// Reveal only the poster texture underneath the letters closest to the pointer.
const heroWordmark = $(".hero-wordmark");
if (heroWordmark) {
  heroWordmark.addEventListener("pointermove", event => {
    const rect = heroWordmark.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    heroWordmark.style.setProperty("--mx", `${x}%`);
    heroWordmark.style.setProperty("--my", `${y}%`);
    heroWordmark.classList.add("is-revealing");
  });
  heroWordmark.addEventListener("pointerleave", () => heroWordmark.classList.remove("is-revealing"));
}

const splash = $("#splash-screen");
window.setTimeout(() => {
  splash.classList.add("is-done");
  document.body.classList.remove("splash-lock");
  window.setTimeout(() => splash.remove(), 1600);
}, 1500);
document.body.classList.add("splash-lock");
