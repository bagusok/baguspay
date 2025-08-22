"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as React from "react";

type CollapsibleProps = React.ComponentProps<typeof CollapsiblePrimitive.Root>;
type CollapsibleTriggerProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleTrigger
>;
type CollapsibleContentProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleContent
>;

function Collapsible(props: CollapsibleProps): React.JSX.Element {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger(props: CollapsibleTriggerProps): React.JSX.Element {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

function CollapsibleContent(props: CollapsibleContentProps): React.JSX.Element {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
