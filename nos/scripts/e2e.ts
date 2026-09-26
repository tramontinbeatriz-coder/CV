/**
 * Teste ponta a ponta com navegador real (Chromium via playwright-core).
 * Sobe o site em modo produção na porta 3100 com um banco SÓ DE TESTE
 * (data/e2e.db) — não mexe nos seus dados.
 *
 *   npm run build && npm run test:e2e
 *   (CHROME_PATH=/caminho/do/chrome se o Chromium não estiver no caminho padrão)
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { chromium, type Browser, type Page } from "playwright-core";

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;
const SHOTS = path.resolve(process.env.E2E_SHOTS ?? "test-results");
const ADMIN = { email: "e2e@nos.test", password: "senha-de-teste-123" };
const env = {
  ...process.env,
  NODE_ENV: "production" as const,
  PORT: String(PORT),
  SITE_URL: BASE,
  DATABASE_URL: "file:./data/e2e.db",
  DATABASE_AUTH_TOKEN: "",
  UPLOAD_DIR: "./data/e2e-uploads",
  STORAGE_PROVIDER: "local",
  PAYMENT_PROVIDER: "mock",
  AUTH_SECRET: "segredo-apenas-para-o-teste-e2e-com-mais-de-32-caracteres",
  ADMIN_EMAIL: ADMIN.email,
  ADMIN_PASSWORD: ADMIN.password,
  EMAIL_PROVIDER: "console",
  WHATSAPP_PROVIDER: "none",
  INSTAGRAM_ACCESS_TOKEN: "",
  LAST_SPOTS_THRESHOLD: "1",
};

let passed = 0;
const failures: string[] = [];
async function step(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failures.push(name);
    console.log(`  ✗ ${name}\n     ${(err as Error).message.split("\n")[0]}`);
  }
}
function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

/** Rola a página inteira (carrega fotos "lazy"), mostra as animações e espera terminarem. */
async function settle(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
    document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible"));
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
}

function inDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("servidor não respondeu");
}

async function register(page: Page, slug: string, who: { name: string; email: string }) {
  await page.goto(`${BASE}/inscricao/${slug}`);
  await page.fill("#name", who.name);
  await page.fill("#email", who.email);
  await page.fill("#phone", "51 99999-0000");
  await page.fill("#instagram", "@teste");
  await page.selectOption("#discoverySource", "instagram");
  await page.check('input[name="terms"]');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/checkout\/teste\//);
}

async function spots(slug: string) {
  const html = await (await fetch(`${BASE}/eventos/${slug}`)).text();
  const m = html.match(/(\d+)<!-- --> <!-- -->vagas? restantes?/) ?? html.match(/(\d+) vagas? restantes?/);
  return { html, available: m ? Number(m[1]) : null, soldOut: html.includes("vagas esgotadas") };
}

async function main() {
  mkdirSync(SHOTS, { recursive: true });
  for (const f of ["data/e2e.db", "data/e2e.db-wal", "data/e2e.db-shm"]) rmSync(f, { force: true });
  rmSync("data/e2e-uploads", { recursive: true, force: true });

  console.log("• preparando banco de teste");
  for (const script of ["scripts/migrate.ts", "scripts/seed.ts"]) {
    const r = spawnSync("npx", ["tsx", script], { env, stdio: "inherit" });
    if (r.status !== 0) throw new Error(`${script} falhou`);
  }
  if (!existsSync(".next/BUILD_ID")) throw new Error("rode `npm run build` antes do teste e2e");

  console.log("• subindo o site em modo produção");
  const busy = await fetch(BASE).then(() => true, () => false);
  if (busy) throw new Error(`a porta ${PORT} já está em uso — feche o outro servidor e rode de novo`);
  // inicia o Next direto (sem npx) para conseguir encerrá-lo no final
  const server: ChildProcess = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)], {
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const serverLog: string[] = [];
  server.stdout?.on("data", (d) => serverLog.push(String(d)));
  server.stderr?.on("data", (d) => serverLog.push(String(d)));

  let browser: Browser | undefined;
  try {
    await waitForServer();
    browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
    const admin = await browser.newPage({ viewport: { width: 1360, height: 900 } });
    const slug = "teste-e2e-oficina";

    console.log("\npainel administrativo");
    await step("login recusa senha errada", async () => {
      await admin.goto(`${BASE}/admin`);
      await admin.waitForURL(/\/admin\/login/);
      await admin.fill('input[name="email"]', ADMIN.email);
      await admin.fill('input[name="password"]', "errada");
      await admin.click('button[type="submit"]');
      await admin.getByText("e-mail ou senha incorretos").waitFor();
    });
    await step("login com a senha certa abre o painel", async () => {
      await admin.fill('input[name="password"]', ADMIN.password);
      await admin.click('button[type="submit"]');
      await admin.waitForURL(`${BASE}/admin`);
      await admin.getByText("visão geral").waitFor();
      await settle(admin);
      await admin.screenshot({ path: `${SHOTS}/admin-dashboard.png`, fullPage: true });
    });
    await step("API do painel exige login", async () => {
      const r = await fetch(`${BASE}/api/admin/export`, { redirect: "manual" });
      assert(r.status === 401, `esperado 401, veio ${r.status}`);
    });

    await step("criar encontro (com foto de capa)", async () => {
      await admin.goto(`${BASE}/admin/eventos/novo`);
      await admin.fill('input[name="title"]', "teste e2e oficina");
      await admin.fill('input[name="tagline"]', "uma tarde para testar tudo.");
      await admin.fill('textarea[name="summary"]', "encontro criado pelo teste automático.");
      await admin.fill('input[name="date"]', inDays(10));
      await admin.fill('input[name="time"]', "18:00");
      await admin.fill('input[name="price"]', "50,00");
      await admin.fill('input[name="totalSpots"]', "3");
      await admin.fill('textarea[name="importantInfo"]', "chegue 10 minutos antes");
      await admin.check('input[name="published"]');
      await admin.setInputFiles('input[name="cover"]', "public/samples/amostra-04.jpg");
      await admin.waitForTimeout(500);
      await admin.click('button[type="submit"]');
      await admin.waitForURL(/\/admin\/eventos\/[^/]+\?criado=1/);
      const html = await (await fetch(`${BASE}/eventos/${slug}`)).text();
      assert(html.includes("teste e2e oficina"), "página pública não mostra o encontro");
      assert(html.includes("/media/capas/"), "foto de capa não foi salva");
    });
    const editUrl = admin.url().split("?")[0];

    await step("editar encontro (local) reflete no site", async () => {
      await admin.fill('input[name="locationName"]', "Local de Teste");
      await admin.click('button[type="submit"]');
      await admin.getByText("alterações salvas").waitFor();
      const { html } = await spots(slug);
      assert(html.includes("Local de Teste"), "local editado não apareceu no site");
    });

    console.log("\ninscrição e pagamento (modo teste)");
    const visitor = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

    await step("formulário valida campos obrigatórios", async () => {
      await visitor.goto(`${BASE}/inscricao/${slug}`);
      await visitor.click('button[type="submit"]');
      await visitor.getByText("conta pra gente seu nome completo").waitFor();
      await visitor.getByText("é preciso aceitar para continuar").waitFor();
      await settle(visitor);
      await visitor.screenshot({ path: `${SHOTS}/mobile-formulario-erros.png`, fullPage: true });
    });

    let firstConfirmation = "";
    await step("inscrição + pagamento aprovado → confirmação", async () => {
      await register(visitor, slug, { name: "Ana Teste", email: "ana@teste.com" });
      await settle(visitor);
      await visitor.screenshot({ path: `${SHOTS}/mobile-checkout-teste.png`, fullPage: true });
      await visitor.getByRole("button", { name: "simular pagamento aprovado" }).click();
      await visitor.waitForURL(/\/confirmacao\//);
      await visitor.getByText("dentro!").first().waitFor();
      await visitor.getByText("seu lugar na nós está confirmado").first().waitFor();
      firstConfirmation = visitor.url();
      await settle(visitor);
      await visitor.screenshot({ path: `${SHOTS}/mobile-confirmacao.png`, fullPage: true });
      const s = await spots(slug);
      assert(s.available === 2, `esperado 2 vagas restantes, veio ${s.available}`);
    });

    await step("arquivo de agenda (.ics) da confirmação", async () => {
      const token = firstConfirmation.split("/confirmacao/")[1];
      const r = await fetch(`${BASE}/api/calendario/${token}`);
      const text = await r.text();
      assert(r.ok && text.includes("BEGIN:VEVENT") && text.includes("teste e2e oficina"), "ics inválido");
    });

    await step("pagamento recusado não ocupa a vaga", async () => {
      await register(visitor, slug, { name: "Bia Teste", email: "bia@teste.com" });
      await visitor.getByRole("button", { name: "simular recusa" }).click();
      await visitor.waitForURL(/falhou=1/);
      await visitor.getByText("o pagamento não foi aprovado").first().waitFor();
      const s = await spots(slug);
      assert(s.available === 2, `esperado 2 vagas restantes, veio ${s.available}`);
    });

    await step("mesmo e-mail não se inscreve duas vezes", async () => {
      await visitor.goto(`${BASE}/inscricao/${slug}`);
      await visitor.fill("#name", "Ana Teste");
      await visitor.fill("#email", "ana@teste.com");
      await visitor.fill("#phone", "51 99999-0000");
      await visitor.check('input[name="terms"]');
      await visitor.click('button[type="submit"]');
      await visitor.getByText("já tem um lugar confirmado").waitFor();
    });

    await step("status automático vira “últimas vagas”", async () => {
      await register(visitor, slug, { name: "Carla Teste", email: "carla@teste.com" });
      await visitor.getByRole("button", { name: "simular pagamento aprovado" }).click();
      await visitor.waitForURL(/\/confirmacao\//);
      const s = await spots(slug);
      assert(s.available === 1, `esperado 1 vaga, veio ${s.available}`);
      assert(s.html.includes("últimas vagas"), "status não mudou para últimas vagas");
    });

    let pendingCheckout = "";
    await step("vaga fica reservada enquanto alguém paga (limite de vagas)", async () => {
      await register(visitor, slug, { name: "Dani Teste", email: "dani@teste.com" });
      pendingCheckout = visitor.url();
      const s = await spots(slug);
      assert(s.soldOut, "com a última vaga reservada, o encontro deveria aparecer esgotado");
    });

    await step("esgotado: botão vira “lista de espera” e formulário some", async () => {
      await visitor.goto(`${BASE}/eventos/${slug}`);
      await visitor.getByText("esgotado").first().waitFor();
      await settle(visitor);
      await visitor.screenshot({ path: `${SHOTS}/mobile-evento-esgotado.png`, fullPage: true });
      await visitor.goto(`${BASE}/inscricao/${slug}`);
      await visitor.getByRole("button", { name: "entrar na lista de espera" }).waitFor();
      assert((await visitor.locator("#discoverySource").count()) === 0, "formulário de inscrição ainda aparece");
    });

    await step("lista de espera registra a pessoa", async () => {
      await visitor.fill("#w-name", "Eva Espera");
      await visitor.fill("#w-email", "eva@teste.com");
      await visitor.fill("#w-phone", "51 98888-0000");
      await visitor.click('button[type="submit"]');
      await visitor.getByText("anotado!").waitFor();
    });

    await step("reserva concluída completa o encontro (3/3)", async () => {
      await visitor.goto(pendingCheckout);
      await visitor.getByRole("button", { name: "simular pagamento aprovado" }).click();
      await visitor.waitForURL(/\/confirmacao\//);
      await visitor.getByText("dentro!").first().waitFor();
      const s = await spots(slug);
      assert(s.soldOut, "deveria estar esgotado");
    });

    console.log("\npainel: inscrições, exportação, duplicar/excluir");
    await step("painel lista inscrições e lista de espera", async () => {
      await admin.goto(`${BASE}/admin/inscricoes`);
      await admin.getByText("Ana Teste").waitFor();
      await admin.getByText("Dani Teste").waitFor();
      await settle(admin);
      await admin.screenshot({ path: `${SHOTS}/admin-inscricoes.png`, fullPage: true });
      await admin.goto(`${BASE}/admin/inscricoes?tipo=espera`);
      await admin.getByText("Eva Espera").waitFor();
    });

    await step("exporta CSV", async () => {
      const cookies = await admin.context().cookies();
      const cookie = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
      const csv = await (await fetch(`${BASE}/api/admin/export`, { headers: { cookie } })).text();
      assert(csv.includes("Ana Teste") && csv.includes("pago ✓") && csv.includes("teste e2e oficina"), "CSV incompleto");
    });

    await step("cancelar inscrição no painel libera a vaga", async () => {
      await admin.goto(`${BASE}/admin/inscricoes?q=carla`);
      admin.once("dialog", (d) => d.accept());
      await admin.locator("table select").first().selectOption("cancelled");
      await admin.waitForTimeout(1500);
      const s = await spots(slug);
      assert(s.available === 1, `esperado 1 vaga liberada, veio ${s.available}`);
    });

    await step("duplicar encontro cria rascunho", async () => {
      await admin.goto(editUrl);
      await admin.getByRole("button", { name: "duplicar" }).click();
      await admin.waitForURL(/duplicado=1/);
      await admin.getByText("cópia criada como rascunho").waitFor();
      const r = await fetch(`${BASE}/eventos/teste-e2e-oficina-copia`);
      assert(r.status === 404, "rascunho não deveria aparecer no site");
    });

    await step("excluir encontro sem inscrições pagas", async () => {
      admin.once("dialog", (d) => d.accept());
      await admin.getByRole("button", { name: "excluir" }).click();
      await admin.waitForURL(/excluido=1/);
    });

    await step("não deixa excluir encontro com inscrições pagas", async () => {
      await admin.goto(editUrl);
      admin.once("dialog", (d) => d.accept());
      await admin.getByRole("button", { name: "excluir" }).click();
      await admin.getByText("tem inscrições pagas").waitFor();
    });

    await step("editar texto da home no painel", async () => {
      await admin.goto(`${BASE}/admin/conteudo`);
      await admin.fill('input[name="hero_title"]', "frase editada pelo teste.");
      await admin.getByRole("button", { name: "salvar conteúdo" }).click();
      await admin.getByText("conteúdo salvo").waitFor();
      const html = await (await fetch(BASE)).text();
      assert(html.includes("frase editada pelo teste."), "home não mostra o texto editado");
    });

    await step("galeria: criar, enviar fotos e destacar na home", async () => {
      await admin.goto(`${BASE}/admin/galeria/novo`);
      await admin.fill('input[name="title"]', "galeria do teste");
      await admin.fill('input[name="date"]', inDays(-20));
      await admin.click('button[type="submit"]');
      await admin.waitForURL(/\/admin\/galeria\/[^/]+\?criado=1/);
      await admin.setInputFiles('input[type="file"][multiple]', ["public/samples/amostra-05.jpg", "public/samples/amostra-06.jpg"]);
      await admin.getByText("fotos (2)").waitFor({ timeout: 20000 });
      await admin.getByRole("button", { name: "★ destacar" }).first().click();
      await admin.getByText("★ na home").waitFor();
      await settle(admin);
      await admin.screenshot({ path: `${SHOTS}/admin-galeria.png`, fullPage: true });
      const html = await (await fetch(`${BASE}/passados`)).text();
      assert(html.includes("galeria do teste") && html.includes("/media/galeria/"), "galeria não apareceu no site");
    });

    console.log("\nvisual");
    await step("páginas públicas no celular e desktop", async () => {
      const desktop = await browser!.newPage({ viewport: { width: 1440, height: 900 } });
      for (const [route, name] of [["/", "home"], ["/eventos", "eventos"], [`/eventos/defesa-pessoal-com-fran`, "evento"], ["/passados", "passados"], ["/sobre", "sobre"]]) {
        for (const [p, label] of [[visitor, "mobile"], [desktop, "desktop"]] as const) {
          const r = await p.goto(`${BASE}${route}`);
          assert(r?.ok(), `${route} respondeu ${r?.status()}`);
          await settle(p);
          await p.screenshot({ path: `${SHOTS}/${label}-${name}.png`, fullPage: true });
        }
      }
      // lightbox
      await desktop.goto(`${BASE}/passados`);
      await desktop.locator('button[aria-label^="ampliar foto"]').first().click();
      await desktop.getByRole("dialog").waitFor();
      await desktop.keyboard.press("ArrowRight");
      await desktop.screenshot({ path: `${SHOTS}/desktop-lightbox.png` });
      await desktop.keyboard.press("Escape");
      // sem rolagem horizontal no celular
      await visitor.goto(BASE);
      const overflow = await visitor.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert(overflow <= 1, `home tem rolagem horizontal no celular (${overflow}px)`);
    });
  } finally {
    await browser?.close();
    server.kill();
    if (failures.length) console.log("\n--- log do servidor ---\n" + serverLog.join("").slice(-4000));
  }

  console.log(`\n${passed} passaram, ${failures.length} falharam. screenshots em ${SHOTS}/`);
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
