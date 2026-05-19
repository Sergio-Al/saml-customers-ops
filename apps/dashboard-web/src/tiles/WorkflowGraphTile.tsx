import { Tile, Badge } from "@ai-ops/ui";
import { GitFork } from "lucide-react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface WorkflowGraphTileProps {
  index?: number;
}

export function WorkflowGraphTile({ index = 0 }: WorkflowGraphTileProps) {
  return (
    <Tile
      size="lg"
      index={index}
      title="Workflow Graph"
      icon={<GitFork size={13} />}
      badge={<Badge tone="neutral">stub</Badge>}
    >
      <div className="relative h-full min-h-[200px] overflow-hidden rounded-md border border-border-op bg-canvas">
        <ReactFlow nodes={[]} edges={[]} fitView proOptions={{ hideAttribution: true }}>
          <Background color="#242933" gap={16} />
          <Controls showInteractive={false} className="!bg-panel !border-border-op" />
        </ReactFlow>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-md border border-border-op bg-panel/80 px-3 py-1.5 text-[12px] font-mono text-text-tertiary backdrop-blur">
            Workflow Builder — Phase 6
          </div>
        </div>
      </div>
    </Tile>
  );
}
