import { useEffect, useRef, useState, type ReactNode } from "react";
import { createTopDockController, type TopDockOptions } from "./topDockController";

export const ANIMATED_TOP_DOCK_VARIANTS = ["sable", "modern", "retro", "glass"] as const;
export type AnimatedTopDockVariant = (typeof ANIMATED_TOP_DOCK_VARIANTS)[number];

export type AnimatedTopDockProps = {
  variant?: AnimatedTopDockVariant;
  proximity?: number;
  spring?: number;
  damping?: number;
  widthGrowth?: number;
  heightGrowth?: number;
  drop?: number;
  /* retro field */
  pixelSize?: number;
  speed?: number;
  noise?: number;
  levels?: number;
  scanlines?: number;
  /* glass field */
  particles?: number;
  thickness?: number;
  dispersion?: number;
  specular?: number;
  rim?: number;
  drift?: number;
  className?: string;
  items?: readonly DockItem[];
  activeId?: string;
  onItemChange?: (id: string) => void;
  onLogoClick?: () => void;
  isLogoActive?: boolean;
  logoContent?: ReactNode;
};

export const ANIMATED_TOP_DOCK_DEFAULTS = {
  variant: "sable" as AnimatedTopDockVariant,
  proximity: 122,
  spring: 0.19,
  damping: 0.7,
  widthGrowth: 17,
  heightGrowth: 16,
  drop: 3.5,
  pixelSize: 4,
  speed: 1,
  noise: 1,
  levels: 7,
  scanlines: 0.32,
  particles: 22,
  thickness: 0.115,
  dispersion: 0.05,
  specular: 0.85,
  rim: 0.5,
  drift: 1,
} as const;

export type DockItem = { id: string; label: string; icon: ReactNode };

export const ITEMS: readonly DockItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <>
        <rect x="2.5" y="2.5" width="4.5" height="4.5" rx=".9" />
        <rect x="9" y="2.5" width="4.5" height="4.5" rx=".9" />
        <rect x="2.5" y="9" width="4.5" height="4.5" rx=".9" />
        <rect x="9" y="9" width="4.5" height="4.5" rx=".9" />
      </>
    ),
  },
  {
    id: "analysis",
    label: "Analysis",
    icon: (
      <>
        <path d="M2.5 13.5h11M3 10.5l3-4 3 2.5 4-6" />
        <circle cx="13" cy="3" r="1.2" />
      </>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: (
      <>
        <path d="M8 2.2 3.2 4.1v4c0 3.3 2.1 6.1 4.8 6.7 2.7-.6 4.8-3.4 4.8-6.7v-4z" />
        <path d="m6.4 8 1.2 1.2 2.4-2.4" />
      </>
    ),
  },
  {
    id: "network",
    label: "Network",
    icon: (
      <>
        <circle cx="8" cy="8" r="5.2" />
        <path d="M2.8 8h10.4M8 2.8a7.8 7.8 0 0 1 0 10.4M8 2.8a7.8 7.8 0 0 0 0 10.4" />
      </>
    ),
  },
  {
    id: "data",
    label: "Data",
    icon: (
      <>
        <ellipse cx="8" cy="4.2" rx="5.2" ry="1.9" />
        <path d="M2.8 4.2v3.8c0 1 2.3 1.9 5.2 1.9s5.2-.9 5.2-1.9V4.2M2.8 8v3.8c0 1 2.3 1.9 5.2 1.9s5.2-.9 5.2-1.9V8" />
      </>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    icon: (
      <>
        <path d="M3.5 2.2h5.5l3.5 3.5v7.8h-9z" />
        <path d="M9 2.2v3.5h3.5M6 8.5v2.8M8 7v4.3M10 9.8v1.5" />
      </>
    ),
  },
  {
    id: "system",
    label: "System",
    icon: (
      <>
        <rect x="4" y="4" width="8" height="8" rx="1.5" />
        <rect x="6.5" y="6.5" width="3" height="3" />
        <path d="M6 2v2M10 2v2M6 12v2M10 12v2M2 6h2M2 10h2M12 6h2M12 10h2" />
      </>
    ),
  },
];

const MODERN_ITEMS: readonly DockItem[] = [
  { id: "product", label: "Product", icon: <><path d="M8 1.9 14.1 5v6L8 14.1 1.9 11V5z" /><path d="M1.9 5 8 8.1 14.1 5M8 8.1v6" /></> },
  { id: "solutions", label: "Solutions", icon: <><path d="M8 1.9 14.4 5.6 8 9.3 1.6 5.6z" /><path d="m2.6 8 5.4 3.1L13.4 8M2.6 10.7 8 13.8l5.4-3.1" /></> },
  { id: "docs", label: "Docs", icon: <><path d="M3.4 2.4h5.4l3.8 3.8v7.4H3.4z" /><path d="M8.8 2.4v3.8h3.8M5.9 9h4.2M5.9 11.2h3" /></> },
  { id: "pricing", label: "Pricing", icon: <><path d="M8.6 2.2H13v4.4l-6.6 6.6a1.2 1.2 0 0 1-1.7 0L2.2 10.5a1.2 1.2 0 0 1 0-1.7z" /><circle cx="10.6" cy="4.6" r=".9" /></> },
  { id: "changelog", label: "Changelog", icon: <><circle cx="8" cy="8" r="5.9" /><path d="M8 4.6V8l2.4 1.5" /></> },
];

/* every retro glyph is drawn on a 7x7 lattice of whole units so the icons stay
   on the same pixel grid as the dithered field behind them */
const RETRO_ITEMS: readonly DockItem[] = [
  { id: "system", label: "SYSTEM", icon: <><rect x="1" y="1" width="2" height="2" /><rect x="4" y="1" width="2" height="2" /><rect x="1" y="4" width="2" height="2" /><rect x="4" y="4" width="2" height="2" /></> },
  { id: "files", label: "FILES", icon: <><rect x="1" y="0" width="4" height="1" /><rect x="1" y="1" width="1" height="5" /><rect x="5" y="1" width="1" height="5" /><rect x="1" y="6" width="5" height="1" /><rect x="2" y="2" width="3" height="1" /><rect x="2" y="4" width="3" height="1" /></> },
  { id: "net", label: "NET", icon: <><rect x="3" y="0" width="1" height="7" /><rect x="0" y="3" width="7" height="1" /><rect x="1" y="1" width="1" height="1" /><rect x="5" y="1" width="1" height="1" /><rect x="1" y="5" width="1" height="1" /><rect x="5" y="5" width="1" height="1" /></> },
  { id: "disk", label: "DISK", icon: <><rect x="0" y="1" width="7" height="5" /><rect x="2" y="0" width="3" height="2" /><rect x="1" y="4" width="5" height="1" /></> },
  { id: "help", label: "HELP", icon: <><rect x="2" y="0" width="3" height="1" /><rect x="4" y="1" width="2" height="2" /><rect x="3" y="3" width="2" height="1" /><rect x="3" y="4" width="1" height="1" /><rect x="3" y="6" width="1" height="1" /></> },
];

const GLASS_ITEMS: readonly DockItem[] = [
  { id: "overview", label: "Overview", icon: <><circle cx="8" cy="8" r="5.8" /><path d="M2.4 8c2.4-3.5 9-3.5 11.3 0" /></> },
  { id: "studio", label: "Studio", icon: <><rect x="2.2" y="2.2" width="11.6" height="11.6" rx="3.6" /><circle cx="8" cy="8" r="2.5" /></> },
  { id: "library", label: "Library", icon: <><rect x="2.1" y="2.6" width="3" height="10.8" rx="1" /><rect x="6.4" y="2.6" width="3" height="10.8" rx="1" /><path d="m10.9 3.7 2.9 1-2.4 8.6-2.2-.8" /></> },
  { id: "motion", label: "Motion", icon: <><path d="M1.8 10.6c2.6 0 3-5.2 6.2-5.2s3.6 5.2 6.2 5.2" /><circle cx="8" cy="5.4" r=".9" /></> },
  { id: "labs", label: "Labs", icon: <><path d="M6.4 2.2v4L3 12.1a1.3 1.3 0 0 0 1.1 2h7.8a1.3 1.3 0 0 0 1.1-2L9.6 6.2v-4" /><path d="M5.6 2.2h4.8M4.9 9.6h6.2" /></> },
];

const VARIANT_ITEMS: Record<AnimatedTopDockVariant, readonly DockItem[]> = {
  sable: ITEMS,
  modern: MODERN_ITEMS,
  retro: RETRO_ITEMS,
  glass: GLASS_ITEMS,
};

const BRAND_MARK = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect width="24" height="24" rx="4.5" fill="#E8E8E3" />
    <path d="M6 6h8.6L18 9.35v8.15H9.15L6 14.35V6Z" fill="#111" />
    <path d="M9 9h5.15L15 9.85V15H9.85L9 14.15V9Z" fill="#E8E8E3" />
    <path d="M12 9v6M9 12h6" stroke="#111" strokeWidth=".7" />
  </svg>
);

function useDockController(getOptions: () => TopDockOptions) {
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    return createTopDockController(root, getOptions);
    /* the getter is a stable ref reader, so the controller is built once */
  }, []);
  return rootRef;
}

type ShaderField = {
  resize: (width: number, height: number) => void;
  render: (now: number) => void;
  setPointer?: (x: number, y: number) => void;
  dispose: () => void;
};

/* both shader variants share the same host lifecycle: measure from the shell,
   pause off-screen and on a hidden tab, and hand the renderer a css-pixel box.
   The module is resolved in its own effect so the effect that owns the GL
   context can create and tear it down synchronously — an async create survives
   its own cleanup and leaves two renderers fighting over one canvas. */
function useShaderField(active: boolean, load: () => Promise<(canvas: HTMLCanvasElement) => ShaderField>) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [factory, setFactory] = useState<{ create: (canvas: HTMLCanvasElement) => ShaderField } | null>(null);

  useEffect(() => {
    if (!active) return undefined;
    let cancelled = false;
    load().then((create) => { if (!cancelled) setFactory({ create }); });
    return () => { cancelled = true; };
  }, [active]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!active || !factory || !host || !canvas) return undefined;
    const field = factory.create(canvas);
    let frame = 0;
    let visible = true;
    let bounds = host.getBoundingClientRect();
    const resize = () => {
      bounds = host.getBoundingClientRect();
      field.resize(bounds.width, bounds.height);
    };
    const tick = (now: number) => {
      field.resize(bounds.width, bounds.height);
      field.render(now);
      frame = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
    };
    const onPointerMove = (event: PointerEvent) => {
      field.setPointer?.(
        ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1,
        -((((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2) - 1),
      );
    };
    const resizeObserver = new ResizeObserver(resize);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible && !frame) frame = requestAnimationFrame(tick);
      if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; }
    });
    resizeObserver.observe(host);
    intersection.observe(host);
    host.addEventListener("pointermove", onPointerMove, { passive: true });
    resize();
    frame = requestAnimationFrame(tick);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      field.dispose();
    };
  }, [active, factory]);

  return { hostRef, canvasRef };
}

export function AnimatedTopDock({ className = "", ...props }: AnimatedTopDockProps) {
  const optionsRef = useRef({ ...ANIMATED_TOP_DOCK_DEFAULTS, ...props });
  optionsRef.current = { ...ANIMATED_TOP_DOCK_DEFAULTS, ...props };
  const variant = optionsRef.current.variant;
  const items = props.items ?? VARIANT_ITEMS[variant] ?? ITEMS;
  const [active, setActive] = useState(props.activeId ?? items[0]?.id ?? "overview");

  useEffect(() => {
    if (props.activeId !== undefined) {
      setActive(props.activeId);
    }
  }, [props.activeId]);

  const handleSelect = (id: string) => {
    setActive(id);
    props.onItemChange?.(id);
  };
  /* one spring, three fits: the command bar pins its track so a bar sized to its
     own content never moves, the terminal renormalises its cells across the
     strip, and the glass rail runs the proximity field down the y axis */
  const rootRef = useDockController(() => ({
    ...optionsRef.current,
    axis: variant === "glass" ? "y" as const : "x" as const,
    distribute: variant === "retro",
    lockTrack: variant === "modern",
  }));

  const retro = useShaderField(variant === "retro", async () => {
    const { createRetroPixelField } = await import("./retroPixelField");
    return (canvas: HTMLCanvasElement) => createRetroPixelField(canvas, () => ({
      pixelSize: optionsRef.current.pixelSize,
      noise: optionsRef.current.noise,
      levels: optionsRef.current.levels,
      speed: optionsRef.current.speed,
    }));
  });
  const glass = useShaderField(variant === "glass", async () => {
    const { createGlassParticleField } = await import("./glassParticleField");
    return (canvas: HTMLCanvasElement) => createGlassParticleField(canvas, () => ({
      count: optionsRef.current.particles,
      thickness: optionsRef.current.thickness,
      dispersion: optionsRef.current.dispersion,
      specular: optionsRef.current.specular,
      rim: optionsRef.current.rim,
      drift: optionsRef.current.drift,
    }));
  });

  const dockItems = (itemClass: string, iconClass: string, viewBox: string) => items.map((item) => (
    <button
      key={item.id}
      className={itemClass}
      data-dock-item
      type="button"
      aria-pressed={active === item.id}
      onClick={() => handleSelect(item.id)}
    >
      <span className={iconClass} aria-hidden="true"><svg viewBox={viewBox}>{item.icon}</svg></span>
      <span>{item.label}</span>
    </button>
  ));

  if (variant === "modern") {
    return (
      <div className={`animated-top-dock-component atd-modern${className ? ` ${className}` : ""}`}>
        <div className="atd-modern__aurora" aria-hidden="true" />
        <header className="atd-modern__bar">
          <a className="atd-modern__brand" href="#top-dock" onClick={(event) => event.preventDefault()}>
            <span className="atd-modern__mark" aria-hidden="true">{BRAND_MARK}</span>
            <span className="atd-modern__word">Lumina</span>
          </a>
          <nav ref={rootRef} className="atd-modern__dock" aria-label="Primary" data-dock-state="idle" data-dock-max="0.00">
            {dockItems("atd-modern__item", "atd-modern__icon", "0 0 16 16")}
          </nav>
          <div className="atd-modern__actions">
            <button className="atd-modern__ghost" type="button">Sign in</button>
            <button className="atd-modern__cta" type="button">
              <span>Start building</span>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 8h9.1M8.6 4.3 12.4 8l-3.8 3.7" /></svg>
            </button>
          </div>
        </header>
        <div className="atd-modern__stage" aria-hidden="true">
          <p className="atd-modern__eyebrow">Interface systems</p>
          <p className="atd-modern__headline">Everything above the fold</p>
        </div>
        <p className="animated-top-dock-component__caption">LOGO LEFT · DOCK CENTRE · ACTION RIGHT</p>
      </div>
    );
  }

  if (variant === "retro") {
    return (
      <div
        ref={retro.hostRef}
        className={`animated-top-dock-component atd-retro${className ? ` ${className}` : ""}`}
        style={{ "--atd-retro-scan": optionsRef.current.scanlines } as React.CSSProperties}
      >
        <canvas ref={retro.canvasRef} className="atd-retro__field" aria-hidden="true" />
        <div className="atd-retro__vignette" aria-hidden="true" />
        <header className="atd-retro__bar">
          <div className="atd-retro__brand">
            <span className="atd-retro__badge" aria-hidden="true">
              <svg viewBox="0 0 7 7"><rect x="0" y="2" width="7" height="3" /><rect x="2" y="0" width="3" height="7" /></svg>
            </span>
            SABLE//OS
          </div>
          <nav ref={rootRef} className="atd-retro__dock" aria-label="Primary" data-dock-state="idle" data-dock-max="0.00">
            {dockItems("atd-retro__item", "atd-retro__icon", "0 0 7 7")}
          </nav>
          <button className="atd-retro__cta" type="button">
            <span aria-hidden="true">▶</span>
            RUN
          </button>
        </header>
        <p className="atd-retro__readout">
          <span>MEM 640K</span>
          <span>DITHER 8×8</span>
          <span>PAL 8</span>
        </p>
        <p className="animated-top-dock-component__caption">FITTED STRIP · ORDERED DITHER</p>
      </div>
    );
  }

  if (variant === "glass") {
    return (
      <div ref={glass.hostRef} className={`animated-top-dock-component atd-glass${className ? ` ${className}` : ""}`} data-dock-frame>
        <canvas ref={glass.canvasRef} className="atd-glass__field" aria-hidden="true" />
        <header className="atd-glass__rail">
          <a className="atd-glass__brand" href="#top-dock" onClick={(event) => event.preventDefault()}>
            <span className="atd-glass__mark" aria-hidden="true">{BRAND_MARK}</span>
            <span className="atd-glass__word">Aperture</span>
          </a>
          <span className="atd-glass__hairline" aria-hidden="true" />
          <nav ref={rootRef} className="atd-glass__dock" aria-label="Primary" data-dock-state="idle" data-dock-max="0.00">
            {dockItems("atd-glass__item", "atd-glass__icon", "0 0 16 16")}
          </nav>
          <span className="atd-glass__hairline" aria-hidden="true" />
          <button className="atd-glass__cta" type="button">
            Get the app
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.4 8h9.2M8.8 4.2 12.6 8l-3.8 3.8" /></svg>
          </button>
        </header>
        <p className="animated-top-dock-component__caption">VERTICAL RAIL · SCREEN-SPACE DISPERSION</p>
      </div>
    );
  }

  return (
    <div className={`animated-top-dock-component${className ? ` ${className}` : ""}`}>
      <nav ref={rootRef} className="animated-top-dock__nav" aria-label="Animated top dock" data-dock-state="idle" data-dock-max="0.00">
        <button
          className={`animated-top-dock__item animated-top-dock__logo${props.isLogoActive ? ' is-active' : ''}`}
          data-dock-item
          type="button"
          aria-label="All Sub-Tabs Navigation Menu"
          title="All Sub-Tabs & Modules Navigation"
          onClick={(e) => {
            e.stopPropagation();
            if (props.onLogoClick) {
              props.onLogoClick();
            } else {
              handleSelect(items[0]?.id ?? "overview");
            }
          }}
        >
          {props.logoContent ?? BRAND_MARK}
        </button>
        {items.map((item) => (
          <button
            key={item.id}
            className="animated-top-dock__item animated-top-dock__link"
            data-dock-item
            type="button"
            aria-pressed={active === item.id}
            onClick={() => handleSelect(item.id)}
          >
            <span className="animated-top-dock__icon" aria-hidden="true"><svg viewBox="0 0 16 16">{item.icon}</svg></span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <p className="animated-top-dock-component__caption">MOVE ACROSS THE DOCK · FOCUS WITH TAB</p>
    </div>
  );
}
