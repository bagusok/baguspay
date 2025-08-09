import { atomWithStorage } from "jotai/utils";

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

export const themeAtom = atomWithStorage<Theme>(
  Theme.LIGHT,
  Theme.LIGHT,
  undefined,
  {
    getOnInit: true,
  },
);
