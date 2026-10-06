// ===== Pas hier prijzen & uren aan =====
// LET OP: prijzen zijn richtprijzen — nog bevestigen met de zaak.
const PRICES = [
  { name: "Knippen", desc: "Fade, taper of klassieke schaarsnit — afgewerkt en gestyled.", price: "€20" },
  { name: "Baard", desc: "Trimmen, contouren en strakke lijnen met het mes.", price: "€12" },
  { name: "Knippen + baard", desc: "De complete fresh-up van top tot kin.", price: "€30" },
  { name: "Knippen + baard + wassen", desc: "Alles erop en eraan, inclusief wasbeurt.", price: "€35" },
  { name: "Baard + epileren + wassen", desc: "Baardverzorging met wenkbrauwen en wasbeurt.", price: "€20" },
  { name: "Kinderen tot 12 jaar", desc: "Een nette cut voor de kleinste klanten.", price: "€15" },
];

// 0 = zondag … 6 = zaterdag. [open, sluit] in "HH:MM", of null = gesloten.
const HOURS = {
  1: ["09:30", "20:00"], 2: ["09:30", "20:00"], 3: ["09:30", "20:00"], 4: ["09:30", "20:00"],
  5: ["09:30", "20:00"], 6: ["09:30", "20:00"], 0: ["09:30", "20:00"],
};
const DAY_NAMES = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

// ===== Prijslijst =====
document.getElementById("priceList").innerHTML = PRICES.map(p => `
  <div class="menu__item">
    <h3>${p.name}</h3><span class="menu__dots"></span><span class="menu__price">${p.price}</span>
    <p>${p.desc}</p>
  </div>`).join("");

// ===== Openingsuren + live status (Belgische tijd) =====
function brusselsNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Brussels", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, mins: (+get("hour") % 24) * 60 + +get("minute") };
}
const toMins = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

function renderHours() {
  const { day, mins } = brusselsNow();
  const order = [1, 2, 3, 4, 5, 6, 0];
  document.getElementById("hours").innerHTML = order.map(d => {
    const h = HOURS[d];
    return `<tr class="${d === day ? "is-today" : ""}"><td>${DAY_NAMES[d]}</td><td>${h ? `${h[0]} – ${h[1]}` : "Gesloten"}</td></tr>`;
  }).join("");

  const today = HOURS[day];
  const isOpen = today && mins >= toMins(today[0]) && mins < toMins(today[1]);
  let text;
  if (isOpen) {
    text = `Nu open · tot ${today[1]}`;
  } else if (today && mins < toMins(today[0])) {
    text = `Gesloten · opent vandaag om ${today[0]}`;
  } else {
    let n = 1;
    while (n < 8 && !HOURS[(day + n) % 7]) n++;
    const next = HOURS[(day + n) % 7];
    text = next ? `Gesloten · opent ${n === 1 ? "morgen" : DAY_NAMES[(day + n) % 7].toLowerCase()} om ${next[0]}` : "Gesloten";
  }
  document.querySelector("[data-status-text]").textContent = text;
  document.querySelector("[data-status-box]").classList.toggle("is-open", !!isOpen);
  const heroStatus = document.querySelector("[data-status]");
  heroStatus.classList.toggle("is-open", !!isOpen);
  heroStatus.textContent = isOpen ? `Nu open · Tiensestraat 188, Leuven` : `Tiensestraat 188 · Leuven`;
}
renderHours();
setInterval(renderHours, 60_000);

// ===== Nav =====
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
});
document.querySelectorAll("#navLinks a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}));

// ===== Reveal on scroll =====
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 90}ms`;
  io.observe(el);
});

// ===== Tellers =====
const counterIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
    const start = performance.now(), dur = 1400;
    const tick = t => {
      const k = Math.min(1, (t - start) / dur), v = end * (1 - Math.pow(1 - k, 3));
      el.textContent = v.toFixed(dec).replace(".", ",");
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterIO.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach(el => counterIO.observe(el));

// ===== Lightbox =====
const items = [...document.querySelectorAll(".gallery__item img")];
const lb = document.getElementById("lightbox");
const lbImg = lb.querySelector("img");
let idx = 0;
const show = i => { idx = (i + items.length) % items.length; lbImg.src = items[idx].src; lbImg.alt = items[idx].alt; };
items.forEach((img, i) => img.parentElement.addEventListener("click", () => { show(i); lb.hidden = false; document.body.style.overflow = "hidden"; }));
const close = () => { lb.hidden = true; document.body.style.overflow = ""; };
lb.querySelector(".lightbox__close").addEventListener("click", close);
lb.querySelector(".lightbox__prev").addEventListener("click", e => { e.stopPropagation(); show(idx - 1); });
lb.querySelector(".lightbox__next").addEventListener("click", e => { e.stopPropagation(); show(idx + 1); });
lb.addEventListener("click", e => { if (e.target === lb) close(); });
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowLeft") show(idx - 1);
  if (e.key === "ArrowRight") show(idx + 1);
});

document.getElementById("year").textContent = new Date().getFullYear();
