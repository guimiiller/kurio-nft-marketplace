import { setupWorker } from "msw/browser";

import { nftHandlers } from "./handlers/nft.handlers";
import { cartHandlers } from "./handlers/cart.handlers";
import { authHandlers } from "./handlers/auth.handlers";
import { checkoutHandlers } from "./handlers/checkout.handlers";
import { profileHandlers } from "./handlers/profile.handlers";
import { walletHandlers } from "./handlers/wallet.handlers";
import { favoritesHandlers } from "./handlers/favorites.handlers";
import { realtimeHandlers } from "./handlers/realtime.handlers";

export const worker = setupWorker(
  ...nftHandlers,
  ...cartHandlers,
  ...authHandlers,
  ...checkoutHandlers,
  ...profileHandlers,
  ...walletHandlers,
  ...favoritesHandlers,
  ...realtimeHandlers,
);
