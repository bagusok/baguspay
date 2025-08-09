import { atomWithStorage } from "jotai/utils";
import { DEVICE_ID_KEY } from "~/common/constant";

export const deviceIdAtom = atomWithStorage<string | null>(
  DEVICE_ID_KEY,
  null,
  undefined,
  {
    getOnInit: true,
  },
);
