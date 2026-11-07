import { setupWorker } from "msw/browser";
import { nftHandlers } from "./handlers/nft.handlers";

export const worker = setupWorker(...nftHandlers);
