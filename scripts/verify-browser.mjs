import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.GATEPASS_BASE_URL || "http://127.0.0.1:4173";
const artifactDir = process.env.GATEPASS_ARTIFACT_DIR || "test-artifacts";
await fs.mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const browserErrors = [];

page.on("pageerror", (error) => browserErrors.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") browserErrors.push(`console: ${message.text()}`);
});

async function open(path, expectedText) {
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  assert(response, `No document response for ${path}`);
  assert(response.status() < 400, `${path} returned HTTP ${response.status()}`);
  if (expectedText) {
    await page.getByText(expectedText, { exact: false }).first().waitFor({ state: "visible" });
  }
  const body = await page.locator("body").innerText();
  assert(!body.includes("Something went wrong"), `${path} rendered an application error`);
  assert(!body.includes("Page not found"), `${path} rendered the 404 page`);
}

try {
  const publicRoutes = [
    ["/", "The association-owned operating system for property work."],
    ["/investors", "The operating system for governed property work."],
    ["/pricing", "The association-owned operating system is $20 per unit per year."],
    ["/onboard", "Show us how property work moves through your community."],
    ["/contractors", "Stop knocking. Bring the information through the HOA."],
    ["/demo", "Choose your perspective"],
    ["/privacy", null],
    ["/terms", null],
  ];

  for (const [path, expectedText] of publicRoutes) await open(path, expectedText);

  await open("/", "The association-owned operating system for property work.");
  await page.screenshot({ path: `${artifactDir}/homepage-desktop.png`, fullPage: true });
  await page.getByRole("link", { name: /See the modeled demo/i }).click();
  await page.waitForURL(/\/demo$/);
  await page.getByText("Choose your perspective", { exact: false }).waitFor();
  await page.goto(`${baseUrl}/`);
  await page.getByRole("link", { name: /Read the investor brief/i }).click();
  await page.waitForURL(/\/investors$/);
  await page.getByText("The operating system for governed property work.", { exact: false }).waitFor();

  await open("/pricing", "The association-owned operating system is $20 per unit per year.");
  await page.getByRole("main").getByRole("link", { name: /Request a workflow review/i }).click();
  await page.waitForURL(/\/onboard$/);

  const boardSubmit = page.getByRole("button", { name: /Request a workflow review/i });
  assert(await boardSubmit.isDisabled(), "HOA workflow-review form should be disabled before required fields are completed");
  await page.getByLabel("Contact name").fill("GatePass CI Board");
  await page.getByLabel("Email").fill("board-ci@example.invalid");
  await page.getByLabel("Board or management role").fill("Board member");
  await page.getByLabel("Community name").fill("Modeled CI Association");
  await page.getByLabel("ZIP code").fill("78732");
  await page.getByLabel("Number of units").fill("120");
  await page.getByLabel("Current management setup").selectOption("self_managed");
  await page.getByLabel("Where the workflow breaks").fill("Signals, approvals, execution evidence, and permanent records are split across systems.");
  assert(!(await boardSubmit.isDisabled()), "HOA workflow-review form did not enable after required fields were completed");
  await boardSubmit.click();
  await page.getByText("Workflow review received.", { exact: true }).waitFor({ timeout: 15000 });

  await open("/contractors", "Stop knocking. Bring the information through the HOA.");
  const contractorSubmit = page.getByRole("button", { name: /Apply for founding access/i });
  assert(await contractorSubmit.isDisabled(), "Contractor form should be disabled before required fields are completed");
  await page.getByLabel("Company Name").fill("GatePass CI Roofing");
  await page.getByLabel("Your Name").fill("GatePass CI Contractor");
  await page.getByLabel("Email").fill("contractor-ci@example.invalid");
  await page.getByLabel("Trade Category").selectOption("roofing");
  await page.getByLabel("Primary ZIP Code").fill("78732");
  assert(!(await contractorSubmit.isDisabled()), "Contractor form did not enable after required fields were completed");
  await contractorSubmit.click();
  await page.getByText("Application received.", { exact: true }).waitFor({ timeout: 15000 });

  await open("/demo", "Choose your perspective");
  await page.getByRole("button", { name: /Board Member/i }).click();
  await page.getByText("MODELED DEMO — NO PRODUCTION CUSTOMER OR TRANSACTION DATA", { exact: true }).waitFor({ timeout: 15000 });
  await page.screenshot({ path: `${artifactDir}/board-demo-desktop.png`, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileNav = page.locator("#gatepass-mobile-view");
  await mobileNav.waitFor({ state: "visible" });
  const moduleValues = await mobileNav.locator("option").evaluateAll((options) => options.map((option) => option.value));
  for (const moduleValue of moduleValues) {
    await mobileNav.selectOption(moduleValue);
    await page.waitForTimeout(350);
    const body = await page.locator("body").innerText();
    assert(!body.includes("Something went wrong"), `Board demo module ${moduleValue} rendered an application error`);
  }
  await page.screenshot({ path: `${artifactDir}/board-demo-mobile.png`, fullPage: true });

  if (browserErrors.length) {
    throw new Error(`Browser console/runtime errors:\n${browserErrors.join("\n")}`);
  }

  console.log(`GatePass browser verification passed for ${publicRoutes.length} public routes, both forms, primary CTAs, and ${moduleValues.length} board-demo views.`);
} finally {
  await context.close();
  await browser.close();
}
