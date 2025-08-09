import { QueryClient } from "@tanstack/query-core";
import { createStore } from "jotai";

export const store = createStore();
export const queryClient = new QueryClient();
