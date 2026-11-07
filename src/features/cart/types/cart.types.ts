export interface CartItem {
  nftId: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  couponCode: string | null;
  version: number;
}

export interface CartItemDetails extends CartItem {
  name: string;
  image: string;
  price: string;
  available: number;
  network: string;
}

export interface CartResponse {
  items: CartItemDetails[];
  couponCode: string | null;
  version: number;
}

export interface CartItemInput {
  nftId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}
