import { measureTextBatch } from "@servrox/console-fx/browser";
import type { TextMeasurementRequest } from "@servrox/console-fx";

// Created only by an explicit measurement action. A worker has its own font set,
// so the studio's CSS fonts cannot enter the core's local-only font measurements.
self.onmessage = (
  event: MessageEvent<{
    requests: readonly TextMeasurementRequest[];
    environment: string;
  }>,
) => {
  self.postMessage(
    measureTextBatch(event.data.requests, event.data.environment),
  );
};
