// This is an explicit browser-startup effect, never a package-import effect.
import { neon } from "@servrox/console-fx/presets";
import { emitConsole } from "@servrox/console-fx/browser";
emitConsole(neon({ text: "Packed Next startup" }), {
  target: "chromium",
  renderer: "css",
  motion: "reduce",
});
