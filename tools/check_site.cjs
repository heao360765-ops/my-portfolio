/* Node + Playwright; the production site itself needs neither. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.SITE_URL || 'http://127.0.0.1:4173/';
const output = process.env.SITE_ARTIFACTS || 'D:/AI-Work/artifacts/wuxi-website';
fs.mkdirSync(output, { recursive: true });
const results = [], errors = [];
function check(name, value, detail = '') { results.push({ name, passed: !!value, detail }); }
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if(r.url().startsWith(base) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  check('First visit presents entrance', await page.locator('.arrival').isVisible());
  await page.screenshot({ path: path.join(output, '01_arrival_desktop.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  check('Esc leaves entrance with body unlocked', await page.locator('.arrival').isHidden() && !(await page.locator('body').evaluate(e => e.classList.contains('modal-open'))));
  check('Focus returns to meaningful navigation', await page.evaluate(() => document.activeElement.matches('.hero-copy .text-link')));
  await page.locator('[data-hour="dusk"][type="button"]').click();
  check('Dusk background is selectable', await page.locator('.home-hero').getAttribute('data-hour') === 'dusk');
  await page.waitForTimeout(750);
  await page.screenshot({ path: path.join(output, '02_home_dusk_desktop.png') });
  await page.locator('[data-hour="day"][type="button"]').click();
  await page.waitForTimeout(750);
  await page.screenshot({ path: path.join(output, '03_home_day_desktop.png') });
  await page.reload({ waitUntil: 'networkidle' });
  check('Session return does not repeat entrance', await page.locator('.arrival').isHidden());

  const pages = ['index', 'world', 'residents', 'rules', 'gallery', 'credits', 'studies', 'download'];
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: width < 500 ? 812 : 1000 });
    for (const slug of pages) {
      await page.goto(`${base}${slug}.html`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      // Load below-the-fold photographs before checking resources and taking a full capture.
      await page.locator('footer').scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      await page.evaluate(() => window.scrollTo(0, 0));
      check(`${slug} ${width}px has no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
      check(`${slug} ${width}px has one primary heading`, await page.locator('h1').count() === 1);
      check(`${slug} ${width}px images load`, await page.locator('img').evaluateAll(images => images.every(i => i.complete && i.naturalWidth > 0)));
      if (['index', 'world', 'gallery'].includes(slug)) check(`${slug} ${width}px landscape photographs keep usable framing`, await page.locator('.daynight-shot img, .interior-grid img, .gallery-item img').evaluateAll(images => images.every(image => { const rect = image.getBoundingClientRect(); return rect.width / rect.height >= 1.2; })));
      if(width !== 768) await page.screenshot({ path: path.join(output, `${slug}_${width}.png`), fullPage: true });
      if(width === 375) {
        await page.locator('.nav-toggle').click();
        check(`${slug} mobile navigation opens`, await page.locator('.main-nav').isVisible());
        await page.keyboard.press('Escape');
        check(`${slug} mobile navigation closes with Esc`, await page.locator('.main-nav').isHidden());
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}world.html`);
  await page.locator('[data-place="country"]').click();
  check('World switches to countryside', await page.locator('#place-title').innerText() === '田野与风车');
  await page.locator('[data-place="station"]').click();
  check('World switches to station', /station.webp$/.test(await page.locator('.place-image').getAttribute('src')));
  await page.goto(`${base}residents.html`);
  for (const [key, name] of [['explorer','探访者'],['doctor','巫医'],['witch','女巫'],['detective','侦探'],['traveller','旅人']]) {
    await page.locator(`[data-character="${key}"]`).click();
    check(`Character ${name} is selectable`, await page.locator('#character-name').innerText() === name && (await page.locator(`[data-character="${key}"]`).getAttribute('aria-pressed')) === 'true');
  }
  await page.goto(`${base}gallery.html`);
  await page.locator('[data-filter="interior"]').click();
  check('Gallery interior filter contains three photographs', await page.locator('.gallery-item:visible').count() === 3);
  await page.locator('.gallery-item:visible button').first().click();
  check('Gallery opens a modal photograph', await page.locator('dialog').evaluate(e => e.open));
  const previous = await page.locator('dialog img').getAttribute('src');
  await page.keyboard.press('ArrowRight');
  check('Gallery keyboard next image works', previous !== await page.locator('dialog img').getAttribute('src'));
  await page.keyboard.press('Escape');
  check('Gallery closes with Esc and returns focus', !(await page.locator('dialog').evaluate(e => e.open)) && await page.evaluate(() => document.activeElement.hasAttribute('data-photo')));
  const reduceContext = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
  const reduced = await reduceContext.newPage();
  await reduced.goto(base, { waitUntil: 'networkidle' });
  await reduced.screenshot({ path: path.join(output, '04_arrival_mobile.png') });
  await reduced.locator('.ticket [data-enter]').click();
  await reduced.waitForTimeout(20);
  check('Reduced motion entry is immediate', await reduced.locator('.arrival').isHidden());
  await reduceContext.close();
  check('No browser errors or missing local resources', errors.length === 0, errors.join('\n'));
  await browser.close();
  const report = { base, checks: results.length, passed: results.filter(r => r.passed).length, results, errors };
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ checks: report.checks, passed: report.passed, failures: results.filter(r => !r.passed) }, null, 2));
  process.exitCode = report.passed === report.checks ? 0 : 1;
})();
