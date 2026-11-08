import { setupWorker } from "msw/browser";

import { nftHandlers } from "./handlers/nft.handlers";
import { cartHandlers } from "./handlers/cart.handlers";
import { authHandlers } from "./handlers/auth.handlers";

export const worker = setupWorker(
  ...nftHandlers,
  ...cartHandlers,
  ...authHandlers,
);
