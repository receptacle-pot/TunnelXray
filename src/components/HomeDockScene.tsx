import { AnimatedTopDock } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export function HomeDockScene() {
  return (
    <div className="shader-frame">
      <AnimatedTopDock
        variant="sable"
        proximity={122}
        spring={0.19}
        damping={0.70}
        widthGrowth={17}
        heightGrowth={16}
        drop={3.5}
      />
    </div>
  );
}

export { HomeDockScene as Scene };
