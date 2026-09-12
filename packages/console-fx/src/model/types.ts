export type Renderer = "css" | "svg" | "text";
export type Target =
  "chromium" | "firefox" | "safari" | "node" | "bun" | "unknown";
export type FontFamily = "sans" | "mono" | "serif";
export type CardPresetId =
  | "buildReceipt"
  | "requestTrace"
  | "serviceReady"
  | "commandCard"
  | "releaseBulletin"
  | "blueprint"
  | "contourMap"
  | "letterpress"
  | "signalHalftone"
  | "orbital";
export type PresentationProfile = `${CardPresetId}/v1`;
export type StatusTone = "success" | "warning" | "error" | "neutral";
export type PresetPresentationInput = {
  readonly kind: "presetCard";
  readonly accent?: string;
  readonly detail?: "minimal" | "standard";
} & (
  | { readonly profile: "requestTrace/v1"; readonly tone?: StatusTone }
  | {
      readonly profile: Exclude<PresentationProfile, "requestTrace/v1">;
      readonly tone?: never;
    }
);
export type PresetPresentation = {
  readonly kind: "presetCard";
  readonly accent: string;
  readonly detail: "minimal" | "standard";
} & (
  | { readonly profile: "requestTrace/v1"; readonly tone: StatusTone }
  | {
      readonly profile: Exclude<PresentationProfile, "requestTrace/v1">;
      readonly tone?: never;
    }
);
export type CinematicProfile =
  | "lightning-metal-v1"
  | "ice-cathedral-v1"
  | "liquid-chrome-v1"
  | "molten-gold-v1";
export interface CinematicMetalEffectInput {
  readonly kind: "cinematicMetal";
  readonly profile?: CinematicProfile;
  readonly color?: string;
  readonly depth?: number;
  readonly glow?: number;
  readonly ornaments?: boolean;
}
export type EffectInput =
  | CinematicMetalEffectInput
  | { readonly kind: "badge"; readonly color?: string }
  | {
      readonly kind: "neon";
      readonly color?: string;
      readonly intensity?: number;
    }
  | { readonly kind: "rgbSplit"; readonly offset?: number }
  | {
      readonly kind: "extruded";
      readonly depth?: number;
      readonly color?: string;
    }
  | { readonly kind: "holographic"; readonly intensity?: number }
  | { readonly kind: "metallic"; readonly variant?: "gold" | "chrome" }
  | { readonly kind: "crt"; readonly intensity?: number }
  | { readonly kind: "rainbow"; readonly saturation?: number }
  | {
      readonly kind: "glowPulse";
      readonly periodMs?: number;
      readonly intensity?: number;
    }
  | {
      readonly kind: "gradientDrift";
      readonly periodMs?: number;
      readonly distance?: number;
    }
  | {
      readonly kind: "wave";
      readonly amplitude?: number;
      readonly periodMs?: number;
    }
  | {
      readonly kind: "indicator";
      readonly color?: string;
      readonly periodMs?: number;
    };
type WithDefaults<T> = T extends EffectInput ? Readonly<Required<T>> : never;
export type Effect = WithDefaults<EffectInput>;
export type EffectKind = Effect["kind"];

export interface TextStyle {
  readonly color: string;
  readonly fontSize: number;
  readonly fontWeight: number;
  readonly fontFamily: FontFamily;
  readonly letterSpacing: number;
}
export interface Surface {
  readonly width: number;
  readonly height: number;
  readonly background: string;
  readonly padding: number;
  readonly borderRadius: number;
}
export interface RunInput {
  readonly text: string;
  readonly style?: Partial<TextStyle>;
  readonly effects?: readonly EffectInput[];
}
export interface LineInput {
  readonly align?: "left" | "center" | "right";
  readonly runs: readonly RunInput[];
}
export interface SceneInputV1 {
  readonly schemaVersion: 1;
  readonly label: string;
  readonly presentation?: PresetPresentationInput;
  readonly surface?: Partial<Surface>;
  readonly lines: readonly LineInput[];
  readonly motion?: {
    readonly durationMs?: number;
    readonly finish?: "freeze";
  };
}
export interface TextRun {
  readonly text: string;
  readonly style: TextStyle;
  readonly effects: readonly Effect[];
}
export interface SceneLine {
  readonly align: "left" | "center" | "right";
  readonly runs: readonly TextRun[];
}
export interface SceneV1 {
  readonly schemaVersion: 1;
  readonly label: string;
  readonly presentation?: PresetPresentation;
  readonly surface: Surface;
  readonly lines: readonly SceneLine[];
  readonly motion: { readonly durationMs: number; readonly finish: "freeze" };
}
export interface Diagnostic {
  readonly code: string;
  readonly severity: "info" | "warning" | "error";
  readonly path: readonly (string | number)[];
  readonly message: string;
}
export type ValidationResult<T> =
  | {
      readonly ok: true;
      readonly value: T;
      readonly diagnostics: readonly Diagnostic[];
    }
  | { readonly ok: false; readonly diagnostics: readonly Diagnostic[] };

export type ParameterDescriptor =
  | {
      readonly type: "number";
      readonly default: number;
      readonly min: number;
      readonly max: number;
      readonly step: number;
    }
  | { readonly type: "color"; readonly default: string }
  | { readonly type: "boolean"; readonly default: boolean }
  | {
      readonly type: "enum";
      readonly default: string;
      readonly values: readonly string[];
    };
export interface EffectDescriptor {
  readonly kind: EffectKind;
  readonly displayName: string;
  readonly family: string;
  readonly scopes: readonly ("run" | "surface")[];
  readonly parameters: Readonly<Record<string, ParameterDescriptor>>;
  readonly renderers: readonly Renderer[];
  readonly motion: "static" | "decorative";
}
export interface PresentationSlot {
  readonly id: string;
  readonly label: string;
  readonly line: number;
  readonly run: number;
  readonly style: TextStyle;
  readonly x: number;
  readonly y: number;
  readonly anchor: "start" | "end";
  readonly safeWidth: number;
  readonly maxCodePoints: number;
  readonly values?: readonly string[];
  readonly editableStyleKeys?: readonly (keyof TextStyle)[];
}
export interface PresentationStatus {
  readonly slot: string;
  readonly source: "text" | "tone";
  readonly palettes: Readonly<
    Record<
      string,
      {
        readonly background: string;
        readonly ink: string;
        readonly marker: string;
        readonly stroke: string;
      }
    >
  >;
}
export interface PresentationDescriptor {
  readonly id: CardPresetId;
  readonly profile: PresentationProfile;
  readonly name: string;
  readonly group: "Useful" | "Artful";
  readonly accent: string;
  readonly background: string;
  readonly rows: readonly number[];
  readonly slots: readonly PresentationSlot[];
  readonly renderers: readonly Renderer[];
  readonly editableStyleKeys: readonly (keyof TextStyle)[];
  readonly parameters: Readonly<Record<string, ParameterDescriptor>>;
  readonly accentGeometry: readonly string[];
  readonly status?: PresentationStatus;
}
export type ConsoleArgs = readonly [format: string, ...values: string[]];
export type CompiledPreview =
  | {
      readonly kind: "css";
      readonly lines: readonly {
        readonly runs: readonly {
          readonly text: string;
          readonly style: Readonly<Record<string, string>>;
        }[];
      }[];
    }
  | {
      readonly kind: "svg";
      readonly imageUri: string;
      readonly width: number;
      readonly height: number;
      readonly alt: string;
    }
  | { readonly kind: "text"; readonly text: string };
export interface CompileOptions {
  readonly target?: Target;
  readonly renderer?: Renderer;
  readonly motion?: "allow" | "reduce";
  readonly unsupported?: "error" | "fallback";
}
export interface CompiledConsole {
  readonly args: ConsoleArgs;
  readonly renderer: Renderer;
  readonly text: string;
  readonly animated: boolean;
  readonly byteLength: number;
  readonly preview: CompiledPreview;
  readonly diagnostics: readonly Diagnostic[];
}
export interface ExportOptions extends Omit<CompileOptions, "motion"> {
  readonly motion?: "system" | "reduce";
}
export interface ExportedConsole {
  readonly code: string;
  readonly byteLength: number;
  readonly diagnostics: readonly Diagnostic[];
}
