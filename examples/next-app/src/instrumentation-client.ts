// This is an explicit browser-startup effect, never a package-import effect.
import { liquidChrome } from "@servrox/console-fx/presets";
import { emitConsole } from "@servrox/console-fx/browser";
emitConsole(liquidChrome({ text: "Packed Next startup" }), {
  target: "chromium",
  renderer: "svg",
  motion: "reduce",
});
