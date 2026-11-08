export interface FavoritesResponse {
  nftIds: string[];
}

export interface FavoriteStatusResponse {
  nftId: string;
  isFavorite: boolean;
}

export interface AddFavoriteInput {
  nftId: string;
}
