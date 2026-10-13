import { test, expect, type Page } from "@playwright/test";
import { LAB_CONFIG, labPeople } from "../lib/labPeople";

const HERO = 'section[aria-labelledby="lab-people-heading"]';
const MEMBERS = 'section[aria-label="Lab members"]';
const N = labPeople.length;

/** Scroll so `frac` (0..1) of the section's pinned distance has passed. */
async function scrollThrough(page: Page, selector: string, frac: number) {
  await page.evaluate(
    async ([sel, f]) => {
      const el = document.querySelector(sel as string) as HTMLElement;
      const sticky = el.firstElementChild as HTMLElement | null;
      const pinned = sticky?.classList.contains("sticky") ? sticky.offsetHeight : innerHeight;
      for (let i = 0; i < 6; i++) {
        const top = el.getBoundingClientRect().top;
        window.scrollTo(0, window.scrollY + top + (f as number) * (el.offsetHeight - pinned));
        await new Promise((r) => setTimeout(r, 400));
      }
    },
    [selector, frac],
  );
}

/** The camera's position on the canvas, read back from the canvas transform. */
async function camera(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector("[data-lab-canvas]") as HTMLElement;
    const screen = canvas.parentElement as HTMLElement;
    const m = new DOMMatrixReadOnly(getComputedStyle(canvas).transform);
    return { x: screen.clientWidth / 2 - m.m41, y: screen.clientHeight / 2 - m.m42 };
  });
}

/** Members' scroll is held until their photographs are in; open the gate. */
async function arm(page: Page) {
  await scrollThrough(page, MEMBERS, 0);
  await page.waitForTimeout(1500);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator(HERO).waitFor({ state: "attached" });
});

test("headline stays on one line and slides with scroll", async ({ page }) => {
  const title = page.locator("#lab-people-heading");
  await expect(title).toHaveText("Meet the amazing people at Net-Centric Computing Lab");
  expect(await title.evaluate((el) => getComputedStyle(el).whiteSpace)).toBe("nowrap");

  // At the start the beginning of the sentence is on screen.
  await scrollThrough(page, HERO, 0);
  const start = (await title.boundingBox())!;
  expect(start.x).toBeGreaterThanOrEqual(0);
  expect(start.x).toBeLessThan(page.viewportSize()!.width / 4);

  await scrollThrough(page, HERO, 0.1);
  const early = (await title.boundingBox())!.x;
  await scrollThrough(page, HERO, 0.8);
  const late = (await title.boundingBox())!.x;

  // Scrolling down moves the text to the left, reading "MEET" → "LAB".
  expect(late).toBeLessThan(early - 100);

  // At the end, the end of the sentence is on screen.
  await scrollThrough(page, HERO, 1);
  const end = (await title.boundingBox())!;
  expect(end.x + end.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(end.x + end.width).toBeGreaterThan(page.viewportSize()!.width / 2);
});

test("members section is dark and every member has the same fields", async ({ page }) => {
  const bg = await page.locator(MEMBERS).evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe("rgb(6, 9, 20)");

  await arm(page);

  const members = page.locator(`${MEMBERS} article`);
  await expect(members).toHaveCount(N);
  for (let i = 0; i < N; i++) {
    const m = members.nth(i);
    await expect(m.locator("h3")).not.toBeEmpty();
    await expect(m.locator(".lab-m-lead")).not.toBeEmpty();
    await expect(m.locator(".lab-m-body")).not.toBeEmpty();
    await expect(m.locator('[aria-label="Skills"] li').first()).toBeAttached();
    // One details card per member, inside that member's own cluster.
    await expect(m.locator(".lab-cluster > .lab-part--card")).toHaveCount(1);
    await expect(m.locator('[aria-label="Skills"]')).toHaveCount(1);
    await expect(m.getByRole("button", { name: "Next" })).toBeAttached();
    await expect(m.getByRole("link", { name: "Full profile" })).toBeAttached();
    await expect(m.locator("img")).toHaveCount(3);
  }
});

test("the camera winds: it moves both ways, never just one direction", async ({ page, isMobile }) => {
  // Twelve samples, each waiting for the scroll and the camera lerp to settle.
  test.setTimeout(90_000);
  await arm(page);

  const xs: number[] = [];
  const ys: number[] = [];
  for (let k = 1; k <= 12; k++) {
    await scrollThrough(page, MEMBERS, k / 13);
    await page.waitForTimeout(700);
    const c = await camera(page);
    xs.push(c.x);
    ys.push(c.y);
  }
  const steps = (v: number[]) => v.slice(1).map((n, i) => n - v[i]);

  if (isMobile) {
    // Phones: mostly downward, swaying left and right.
    expect(steps(ys).every((d) => d > 0)).toBe(true);
    expect(steps(xs).some((d) => d > 5)).toBe(true);
    expect(steps(xs).some((d) => d < -5)).toBe(true);
  } else {
    // Desktop: always onward to the right, but both down and up.
    expect(steps(xs).every((d) => d > 0)).toBe(true);
    expect(steps(ys).some((d) => d > 20)).toBe(true);
    expect(steps(ys).some((d) => d < -20)).toBe(true);
  }

  // No page-level horizontal scrollbar anywhere along the way.
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("on a member's anchor they fill the screen, and the counter follows", async ({ page }) => {
  await arm(page);

  // Members sit at equal distances along the path, so member 5 (index 4) is
  // at the same share of the pin whatever shape the path has.
  await scrollThrough(page, MEMBERS, 4.5 / N);
  await page.waitForTimeout(1500);

  const nearest = await page.evaluate(() => {
    const arts = [...document.querySelectorAll('section[aria-label="Lab members"] article')];
    const d = (a: Element) => {
      const r = a.querySelector(".lab-part--text")!.getBoundingClientRect();
      return Math.hypot(r.left + r.width / 2 - innerWidth / 2, r.top + r.height / 2 - innerHeight / 2);
    };
    return arts.sort((a, b) => d(a) - d(b))[0].querySelector("h3")!.textContent;
  });
  expect(nearest).toBe("Danish Chitato");

  const text = page.locator(`${MEMBERS} article`).nth(4).locator(".lab-part--text");
  const box = (await text.boundingBox())!;
  const vp = page.viewportSize()!;
  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height);

  // The counter digits read "05".
  const digits = await page.evaluate(() =>
    [...document.querySelectorAll('section[aria-label="Lab members"] .font-mono.text-white > span.block')].map(
      (el) => {
        const strip = el.firstElementChild as HTMLElement;
        const r = el.getBoundingClientRect();
        return [...strip.children].find((c) => Math.abs(c.getBoundingClientRect().top - r.top) < r.height / 2)
          ?.textContent;
      },
    ),
  );
  expect(digits.join("")).toBe("05");
});

/** Scroll to member `i`'s anchor and let the camera settle there. */
async function toMember(page: Page, i: number) {
  await scrollThrough(page, MEMBERS, (i + 0.5) / N);
  await page.waitForTimeout(1500);
}

test("each member is one compact cluster that fits the screen", async ({ page, isMobile }) => {
  test.setTimeout(90_000);
  await arm(page);

  // The first four cover every arrangement: A, B, and both mirrored.
  for (let i = 0; i < 4; i++) {
    await toMember(page, i);
    const r = await page.evaluate((i) => {
      const box = (el: Element) => {
        const b = el.getBoundingClientRect();
        return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height };
      };
      const arts = [...document.querySelectorAll('section[aria-label="Lab members"] article')];
      const cluster = arts[i].querySelector(".lab-cluster")!;
      const parts = [...cluster.children].map((el) => ({
        kind: el.className,
        ...box(el),
        overflow: el.scrollHeight - el.clientHeight,
      }));
      const others = arts
        .filter((_, j) => j !== i)
        .map((a) => box(a.querySelector(".lab-cluster")!))
        .filter((b) => b.r > 0 && b.l < innerWidth && b.b > 0 && b.t < innerHeight);
      return { cluster: box(cluster), parts, others, vw: innerWidth, vh: innerHeight };
    }, i);

    const c = r.cluster;
    // On screen, and no bigger than 90vw × 80vh.
    expect(c.l).toBeGreaterThanOrEqual(0);
    expect(c.r).toBeLessThanOrEqual(r.vw);
    expect(c.t).toBeGreaterThanOrEqual(64); // below the navbar
    expect(c.b).toBeLessThanOrEqual(r.vh);
    expect(c.w).toBeLessThanOrEqual(0.9 * r.vw);
    expect(c.h).toBeLessThanOrEqual(0.8 * r.vh);

    expect(r.parts).toHaveLength(5);
    for (const p of r.parts) {
      // Inside the cluster, and nothing spills out of its own cell.
      expect(p.l, p.kind).toBeGreaterThanOrEqual(c.l - 1);
      expect(p.r, p.kind).toBeLessThanOrEqual(c.r + 1);
      expect(p.t, p.kind).toBeGreaterThanOrEqual(c.t - 1);
      expect(p.b, p.kind).toBeLessThanOrEqual(c.b + 1);
      expect(p.overflow, p.kind).toBeLessThanOrEqual(1);
    }
    // No two parts overlap.
    for (const [a, p] of r.parts.entries()) {
      for (const q of r.parts.slice(a + 1)) {
        const ox = Math.min(p.r, q.r) - Math.max(p.l, q.l);
        const oy = Math.min(p.b, q.b) - Math.max(p.t, q.t);
        expect(ox <= 1 || oy <= 1, `${p.kind} overlaps ${q.kind}`).toBe(true);
      }
    }
    // Only this member is on screen.
    expect(r.others, `member ${i + 1} shares the screen`).toHaveLength(0);
  }

  // Phones: the real column stays within the height the spacing assumes.
  if (isMobile) {
    const tallest = await page.evaluate(() =>
      Math.max(
        ...[...document.querySelectorAll(".lab-cluster")].map((el) => el.getBoundingClientRect().height),
      ) / innerHeight,
    );
    expect(tallest).toBeLessThanOrEqual(0.8);
  }
});

/** Every element in the members section whose computed opacity is not 1. */
async function dimmed(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('section[aria-label="Lab members"], section[aria-label="Lab members"] *')]
      .filter((el) => getComputedStyle(el).opacity !== "1")
      .map((el) => `${el.tagName.toLowerCase()}.${el.className}`),
  );
}

test("nothing fades: every element stays fully opaque", async ({ page }) => {
  test.setTimeout(90_000);
  await arm(page);
  for (const f of [0.02, 0.5 / N, 1 / N, 2.3 / N, 0.98]) {
    await scrollThrough(page, MEMBERS, f);
    await page.waitForTimeout(800);
    expect(await dimmed(page)).toEqual([]);
  }
});

test("reduced motion: members stack with no canvas and no fades", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(MEMBERS).waitFor({ state: "attached" });

  // The preference is read on the client, so the pinned canvas gives way
  // to the stacked list once the page hydrates.
  await expect(page.locator("[data-lab-canvas]")).toHaveCount(0);
  await expect(page.locator(`${MEMBERS} article`)).toHaveCount(N);

  await page.locator(`${MEMBERS} article`).nth(3).scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  expect(await dimmed(page)).toEqual([]);

  // Nothing assembles either: every part stays exactly in place.
  const moved = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-lab-move]")].filter((el) => el.style.transform).length,
  );
  expect(moved).toBe(0);
});

/** Member `i`'s title and moving parts: where they are, and how far each part
 *  has been slid from its place. */
async function assembly(page: Page, i: number) {
  return page.evaluate((i) => {
    const arts = [...document.querySelectorAll('section[aria-label="Lab members"] article')];
    const rect = (el: Element) => {
      const b = el.getBoundingClientRect();
      return { l: b.left, t: b.top, r: b.right, b: b.bottom };
    };
    const slid = (el: HTMLElement) => {
      const m = el.style.transform.match(/translate3d\((-?[\d.]+)px, (-?[\d.]+)px/);
      return m ? { x: +m[1], y: +m[2] } : { x: 0, y: 0 };
    };
    const parts = (a: Element) => ({
      title: { ...rect(a.querySelector("[data-lab-title]")!), transform: (a.querySelector("[data-lab-title]") as HTMLElement).style.transform },
      movers: [...a.querySelectorAll<HTMLElement>("[data-lab-move]")].map((el) => ({
        kind: el.dataset.labMove!,
        ...rect(el),
        slid: slid(el),
      })),
    });
    return { own: parts(arts[i]), others: arts.filter((_, j) => j !== i).map(parts) };
  }, i);
}

type Box = { l: number; t: number; r: number; b: number };
const gapBetween = (p: Box, q: Box) =>
  Math.hypot(Math.max(0, q.l - p.r, p.l - q.r), Math.max(0, q.t - p.b, p.t - q.b));
const centre = (p: Box) => ({ x: (p.l + p.r) / 2, y: (p.t + p.b) / 2 });

test("parts assemble on the title at the anchor and spread away from it between members", async ({
  page,
  isMobile,
}) => {
  test.setTimeout(120_000);
  await arm(page);
  const max = isMobile ? LAB_CONFIG.assemble.mobileMaxOffset : LAB_CONFIG.assemble.maxOffset;

  // On member 2's anchor: everything in its exact place.
  await toMember(page, 1);
  const on = await assembly(page, 1);
  expect(on.own.title.transform).toBe("");
  expect(on.own.movers).toHaveLength(5);
  for (const m of on.own.movers) expect(Math.hypot(m.slid.x, m.slid.y), m.kind).toBeLessThan(1);

  // Halfway between two members both are fully apart. Members 1–4 cover all
  // four arrangements.
  for (let i = 0; i < 4; i++) {
    await scrollThrough(page, MEMBERS, (i + 1) / N);
    await page.waitForTimeout(1500);
    for (const k of [i, i + 1]) {
      const { own, others } = await assembly(page, k);
      expect(own.title.transform).toBe("");
      const T = centre(own.title);

      for (const m of own.movers) {
        const off = Math.hypot(m.slid.x, m.slid.y);
        // A small, staggered amount…
        expect(off, `${k + 1} ${m.kind}`).toBeGreaterThanOrEqual(0.8 * max - 1);
        expect(off, `${k + 1} ${m.kind}`).toBeLessThanOrEqual(1.2 * max + 1);
        // …pointing away from the title.
        const c = centre(m);
        const rest = { x: c.x - m.slid.x - T.x, y: c.y - m.slid.y - T.y };
        expect(rest.x * m.slid.x + rest.y * m.slid.y, `${k + 1} ${m.kind} moves toward the title`).toBeGreaterThan(0);
        // Still nearer its own title than anything of anyone else's.
        const ownGap = gapBetween(m, own.title);
        for (const o of others) {
          for (const q of [o.title, ...o.movers]) {
            expect(gapBetween(m, q), `${k + 1} ${m.kind} drifts toward another member`).toBeGreaterThan(ownGap);
          }
        }
      }

      // Spread out, still nothing overlaps.
      const boxes = [{ kind: "title", ...own.title }, ...own.movers];
      for (const [a, p] of boxes.entries()) {
        for (const q of boxes.slice(a + 1)) {
          const ox = Math.min(p.r, q.r) - Math.max(p.l, q.l);
          const oy = Math.min(p.b, q.b) - Math.max(p.t, q.t);
          expect(ox <= 1 || oy <= 1, `member ${k + 1}: ${p.kind} overlaps ${q.kind}`).toBe(true);
        }
      }
    }
  }
});
