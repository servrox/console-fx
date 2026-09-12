import { test, expect } from "../studio/fixtures";

test("packed Next startup, first-enabled root-layout banner, edits and true remount", async ({
  page,
}) => {
  const logs: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "log") logs.push(message.text());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Packed Next consumer" }),
  ).toBeVisible();
  await expect.poll(() => logs.length).toBe(1);
  expect(logs[0]).toContain("Packed Next startup");
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Current enabled text");
  expect(logs).toHaveLength(1);
  await page
    .getByRole("button", { name: "Enable banner", exact: true })
    .click();
  await expect.poll(() => logs.length).toBe(2);
  expect(logs[1]).toContain("Current enabled text");
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Later edit");
  await page
    .getByRole("button", { name: "Disable banner", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Enable banner", exact: true })
    .click();
  expect(logs).toHaveLength(2);
  await page
    .getByRole("button", { name: "Remount banner", exact: true })
    .click();
  await expect.poll(() => logs.length).toBe(3);
  expect(logs[2]).toContain("Later edit");
  await page
    .getByRole("button", { name: "Print message", exact: true })
    .click();
  await expect.poll(() => logs.length).toBe(4);
  expect(logs[3]).toContain("Later edit");
  await page.reload();
  await expect.poll(() => logs.length).toBe(5);
  expect(logs[4]).toContain("Packed Next startup");
});
