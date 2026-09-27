import { StructureFlowCollection } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export function Scene() {
  return (
    <div className="shader-frame">
      <StructureFlowCollection
        variant="structure-flow"
        speed={1.00}
        pointSize={0.080}
        opacity={0.40}
        maskStart={0.20}
        maskSolid={0.50}
      />
    </div>
  );
}
