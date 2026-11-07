import { setupWorker } from "msw/browser";

import { nftHandlers } from "./handlers/nft.handlers";
import { cartHandlers } from "./handlers/cart.handlers";

export const worker = setupWorker(...nftHandlers, ...cartHandlers);
