export interface CheckoutQuoteInput {
  couponCode: string | null;
}

export interface CheckoutQuoteItem {
  nftId: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: string;
  total: string;
  network: string;
}

export interface CheckoutQuote {
  id: string;
  cartVersion: number;
  items: CheckoutQuoteItem[];
  couponCode: string | null;
  subtotal: string;
  discount: string;
  networkFee: string;
  total: string;
  expiresAt: number;
}

export interface CreateOrderInput {
  quoteId: string;
  walletAddress: string;
  walletType: "metamask" | "walletconnect" | "coinbase";
  idempotencyKey: string;
}

export interface Order {
  id: string;
  userId: string;
  quoteId: string;
  items: CheckoutQuoteItem[];
  couponCode: string | null;
  subtotal: string;
  discount: string;
  networkFee: string;
  total: string;
  walletAddress: string;
  walletType: CreateOrderInput["walletType"];
  status: "confirmed";
  createdAt: string;
}
