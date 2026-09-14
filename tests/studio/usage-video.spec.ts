import { test, expect } from "./fixtures";

test("usage video loads on request, plays with captions and has a text alternative", async ({
  page,
}) => {
  const mediaRequests: string[] = [];
  const entries: string[] = [];
  page.on("request", (request) => {
    if (/console-fx-usage\.(mp4|webm)/.test(request.url()))
      mediaRequests.push(request.url());
  });
  page.on("console", (entry) => {
    if (entry.type() === "log") entries.push(entry.text());
  });
  await page.goto("/docs/");
  const video = page.getByLabel("ConsoleFX usage walkthrough", { exact: true });
  await expect(video).toBeVisible();
  expect(mediaRequests).toEqual([]);
  await expect(video).toHaveJSProperty("paused", true);
  await expect(video).toHaveJSProperty("controls", true);
  await video.scrollIntoViewIfNeeded();
  await video.focus();
  await page.keyboard.press("Space");
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeGreaterThan(0);
  const playback = await video.evaluate((element: HTMLVideoElement) => ({
    duration: element.duration,
    width: element.videoWidth,
    height: element.videoHeight,
    captions: element.textTracks[0]?.cues?.length,
    mode: element.textTracks[0]?.mode,
    lastCueEnd:
      element.textTracks[0]?.cues?.[element.textTracks[0].cues.length - 1]
        ?.endTime,
  }));
  expect(playback.duration).toBeGreaterThan(30);
  expect(playback.duration).toBeLessThan(90);
  expect([playback.width, playback.height]).toEqual([1440, 960]);
  expect(playback.captions).toBeGreaterThanOrEqual(6);
  expect(playback.mode).toBe("showing");
  expect(playback.lastCueEnd).toBeLessThanOrEqual(playback.duration + 0.1);
  await page.keyboard.press("Space");
  await expect(video).toHaveJSProperty("paused", true);
  expect(mediaRequests.length).toBeGreaterThan(0);
  await page.getByText("Read the walkthrough", { exact: true }).click();
  await expect(page.locator(".usage-transcript ol")).toContainText(
    "Your previous scene remains available in Undo",
  );
  expect(entries).toEqual([]);
});
