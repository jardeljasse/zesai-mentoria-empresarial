/* =========================================================
   CONFIGURAÇÃO DO EVENTO — altere apenas aqui
   ========================================================= */
const CONFIG = {
  formUrl: "https://forms.gle/iaLzZMxMus1mrAuN9",
  // Data/hora do webinar no fuso de Moçambique (CAT, UTC+02:00)
  eventStart: "2026-11-19T18:45:00+02:00",
  durationMinutes: 120,
  registrationDeadline: "2026-11-19T18:45:00+02:00",
  platform: "Google Meet",
  whatsappNumber: "258856333821",
  // {data} e {hora} são substituídos automaticamente
  whatsappMessage:
    "Saudações, equipa ZESAI! Vi a página da Mentoria Empresarial e gostaria de saber mais sobre o webinar de Incubação e Aceleração de Negócios de {data}, às {hora}. Tenho interesse em participar. Obrigado(a)!",
  eventTitle: "Webinar ZESAI · Incubação e Aceleração de Desenvolvimento de Negócios",
};

const COMPANIES = [
  ["Fazenda Kukula", "Produção e comercialização agrícola", "fazenda-kukula.jpg"],
  ["Welding Service", "Serviços de serralharia e soldadura", "welding.jpg"],
  ["M Business Connections", "Serviços de marketing e publicidade", "m-business.png"],
  ["Bell Services", "Serviços de confeitaria e formação", "bell-services.jpg"],
  ["Propósito — Livraria e Editora", "Serviços de livraria e editora", "proposito.jpg"],
  ["Frozenland", "Produção e venda de sorvetes", "frozenland.jpg"],
  ["Texeira Frio & Serviços", "Climatização e refrigeração", "texeira.jpg"],
  ["Canan Serviços", "Consultoria, electricidade, refrigeração e fornecimento de materiais", "canan.jpg"],
  ["Lá Vina Beauty", "Cosméticos, beleza e higiene", "la-vina.png"],
  ["Songo Carmaster", "Lavagem de veículos", "songo-carmaster.jpg"],
  ["Maxmor & Tecnologia Moçambique", "Desenvolvimento de software, electrónicos e formação", "maxmor.jpg"],
  ["LJaqueta's", "Serviços de línguas e tradução", "ljaquetas.jpg"],
  ["Acsa — Engenharia & Automação", "Energias e engenharia", "acsa.jpg"],
  ["Batilde Artes", "Corte e costura, croché e tricô", "batilde.jpg"],
  ["Agropomba", "Produção agrícola e suinocultura", "agropomba.jpg"],
  ["Frango Fala Comigo", "Produção e comercialização de frangos", "frango-fala-comigo.jpg"],
  ["Brithol Multi Service", "Contabilidade, assessoria fiscal e recursos humanos", "brithol.jpg"],
  ["Brgest", "Produção e fornecimento de sistemas informáticos", "brgest.jpg"],
  ["MarroMech Engineering", "Serviços de serralharia e soldadura", "marromech.jpg"],
  ["EJF Multiserviços, Lda", "Contabilidade e recursos humanos", "ejf.jpg"],
];

/* ========================================================= */

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const pad = (n) => String(n).padStart(2, "0");

// Partes da data sempre no fuso de Maputo, independentemente do fuso do visitante
function partsInMaputo(iso) {
  const d = new Date(iso);
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Maputo", year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const get = (t) => Number(f.find((p) => p.type === t).value);
  return { y: get("year"), m: get("month"), d: get("day"), h: get("hour"), min: get("minute") };
}

function fillConfig() {
  const e = partsInMaputo(CONFIG.eventStart);
  const dl = partsInMaputo(CONFIG.registrationDeadline);
  const values = {
    day: pad(e.d),
    month: MONTHS[e.m - 1],
    year: e.y,
    time: `${pad(e.h)}:${pad(e.min)}`,
    dateShort: `${pad(e.d)}/${pad(e.m)}/${e.y}`,
    dateLong: `${e.d} de ${MONTHS[e.m - 1]} de ${e.y}`,
    deadlineShort: `${pad(dl.d)}/${pad(dl.m)}/${dl.y}`,
    deadlineLong: `${dl.d} de ${MONTHS[dl.m - 1]} de ${dl.y}`,
    platform: CONFIG.platform,
  };
  document.querySelectorAll("[data-cfg]").forEach((el) => {
    const v = values[el.dataset.cfg];
    if (v !== undefined) el.textContent = v;
  });

  document.querySelectorAll("[data-form-link]").forEach((a) => { a.href = CONFIG.formUrl; });

  // WhatsApp com mensagem pré-preenchida
  const waText = CONFIG.whatsappMessage.replace("{data}", values.dateShort).replace("{hora}", values.time);
  document.querySelectorAll("[data-wa-link]").forEach((a) => {
    a.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(waText)}`;
  });

  buildCalendarLinks();

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}

// "Adicionar ao calendário": Google, Outlook.com, Microsoft 365 e ficheiro .ics (Apple, Outlook desktop, etc.)
function buildCalendarLinks() {
  const start = new Date(CONFIG.eventStart);
  const end = new Date(start.getTime() + CONFIG.durationMinutes * 60000);
  const title = CONFIG.eventTitle;
  const details = `Webinar gratuito via ${CONFIG.platform}. O link será partilhado no grupo de WhatsApp após a inscrição: ${CONFIG.formUrl}`;
  const location = CONFIG.platform;
  const compact = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); // 20261119T164500Z
  const iso = (d) => d.toISOString().replace(/\.\d{3}/, ""); // 2026-11-19T16:45:00Z

  const google = new URL("https://calendar.google.com/calendar/render");
  google.search = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${compact(start)}/${compact(end)}`, details, location });

  const ms = (host) => {
    // o Outlook mostra "+" literalmente, por isso codificamos os espaços como %20
    const p = { path: "/calendar/action/compose", rru: "addevent", subject: title, startdt: iso(start), enddt: iso(end), body: details, location };
    const qs = Object.entries(p).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    return `https://${host}/calendar/0/deeplink/compose?${qs}`;
  };

  const esc = (s) => s.replace(/[\\;,]/g, (c) => "\\" + c);
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ZESAI//Mentoria Empresarial//PT", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:webinar-${compact(start)}@zesai.org`,
    `DTSTAMP:${compact(new Date())}`,
    `DTSTART:${compact(start)}`,
    `DTEND:${compact(end)}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(details)}`,
    `LOCATION:${esc(location)}`,
    "BEGIN:VALARM", "TRIGGER:-PT1H", "ACTION:DISPLAY", "DESCRIPTION:Lembrete do webinar ZESAI", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");

  const hrefs = {
    google: google.toString(),
    outlook: ms("outlook.live.com"),
    office: ms("outlook.office.com"),
    ics: "data:text/calendar;charset=utf-8," + encodeURIComponent(ics),
  };
  document.querySelectorAll("[data-cal]").forEach((a) => { a.href = hrefs[a.dataset.cal]; });

  // fecha o menu ao clicar fora ou numa opção
  const menu = document.getElementById("calMenu");
  if (menu) {
    document.addEventListener("click", (e) => { if (!menu.contains(e.target)) menu.open = false; });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { menu.open = false; }));
  }
}

function startCountdown() {
  const box = document.getElementById("countdown");
  const done = document.getElementById("countdownDone");
  if (!box) return;
  const target = new Date(CONFIG.eventStart).getTime();
  const end = target + CONFIG.durationMinutes * 60000;
  const out = { d: box.querySelector('[data-cd="d"]'), h: box.querySelector('[data-cd="h"]'), m: box.querySelector('[data-cd="m"]'), s: box.querySelector('[data-cd="s"]') };

  const tick = () => {
    const now = Date.now();
    if (now >= target) {
      box.hidden = true;
      done.hidden = false;
      done.textContent = now < end
        ? "O webinar está a decorrer agora! Entre pelo link partilhado no grupo de WhatsApp."
        : "Esta sessão já decorreu. Inscreva-se para ser avisado da próxima edição e do início da mentoria.";
      return false;
    }
    let diff = Math.floor((target - now) / 1000);
    out.d.textContent = pad(Math.floor(diff / 86400)); diff %= 86400;
    out.h.textContent = pad(Math.floor(diff / 3600)); diff %= 3600;
    out.m.textContent = pad(Math.floor(diff / 60));
    out.s.textContent = pad(diff % 60);
    return true;
  };
  if (tick()) {
    const id = setInterval(() => { if (!tick()) clearInterval(id); }, 1000);
  }
}

function buildMarquee() {
  const rows = document.querySelectorAll(".marquee__track");
  if (!rows.length) return;
  const half = Math.ceil(COMPANIES.length / 2);
  const groups = [COMPANIES.slice(0, half), COMPANIES.slice(half)];
  const initials = (name) => name.split(/\s+/).filter((w) => /^[A-Za-zÀ-ÿ]/.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const item = ([name, sector, logo], hidden) => `
    <li class="company"${hidden ? ' aria-hidden="true"' : ""}>
      ${logo
        ? `<img src="assets/empresas/${logo}" alt="${hidden ? "" : "Logótipo " + name}" loading="lazy" width="64" height="64">`
        : `<span class="company__initials" aria-hidden="true">${initials(name)}</span>`}
      <div><b>${name}</b><span>${sector}</span></div>
    </li>`;
  rows.forEach((row, i) => {
    const list = groups[i] || [];
    // duplicado para o loop contínuo
    row.innerHTML = list.map((c) => item(c, false)).join("") + list.map((c) => item(c, true)).join("");
  });
}

function revealOnScroll() {
  const targets = document.querySelectorAll(".reveal, .pains, .director__photo");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      // pequeno atraso em cascata para itens irmãos
      const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains("reveal")) : [];
      const idx = Math.max(0, siblings.indexOf(el));
      el.style.transitionDelay = `${Math.min(idx, 6) * 80}ms`;
      el.classList.add("is-visible");
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  targets.forEach((el) => io.observe(el));
}

function animateCounters() {
  const els = document.querySelectorAll("[data-count]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const to = Number(el.dataset.count);
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / 1400);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
}

function navBehaviour() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const fab = document.querySelector(".fab");
  const hero = document.querySelector(".hero");

  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
    if (fab && hero) fab.classList.toggle("is-shown", window.scrollY > hero.offsetHeight * 0.7);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
  });
  document.querySelectorAll(".nav__links a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  // link activo conforme a secção visível
  const links = new Map([...document.querySelectorAll(".nav__links a")].map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const link = links.get(en.target.id);
      if (link && en.isIntersecting) {
        links.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

document.addEventListener("DOMContentLoaded", () => {
  fillConfig();
  buildMarquee();
  startCountdown();
  revealOnScroll();
  animateCounters();
  navBehaviour();
});
