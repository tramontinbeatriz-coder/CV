/* Progressive enhancement only — the site is fully readable without JS. */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Reveal on scroll ── */
const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal]');
if ('IntersectionObserver' in window && !reduced) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* ── Count-up metrics ── */
const counters = document.querySelectorAll<HTMLElement>('[data-count]');
if ('IntersectionObserver' in window && !reduced) {
  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.count);
    const prefix = el.dataset.prefix ?? '';
    const suffix = el.dataset.suffix ?? '';
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          run(e.target as HTMLElement);
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.6 },
  );
  counters.forEach((el) => io.observe(el));
}

/* ── Navigation: background after scroll, hide on scroll down ── */
const nav = document.querySelector<HTMLElement>('[data-nav]');
let lastY = window.scrollY;
const onScroll = () => {
  if (!nav) return;
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 24);
  const menuOpen = document.documentElement.classList.contains('menu-open');
  nav.classList.toggle('is-hidden', !menuOpen && y > 400 && y > lastY + 4);
  if (y < lastY - 4) nav.classList.remove('is-hidden');
  lastY = y;
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── Mobile menu ── */
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
const setMenu = (open: boolean) => {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
  document.documentElement.classList.toggle('menu-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
};
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
document.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));
window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => e.matches && setMenu(false));

/* ── Copy email ── */
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  const original = btn.textContent;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy ?? '');
      btn.textContent = `${btn.dataset.copiedLabel} ✓`;
      btn.classList.add('is-copied');
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('is-copied');
      }, 2000);
    } catch {
      /* Clipboard unavailable — the mailto link still works. */
    }
  });
});
