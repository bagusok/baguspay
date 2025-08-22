import * as React from "react";
import { cn } from "../../lib/utils";

type SkeletonProps = React.ComponentProps<"div"> & { className?: string };

function Skeleton({ className, ...props }: SkeletonProps): React.JSX.Element {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
