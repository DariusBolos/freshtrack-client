export type FoodProduct = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expiryDate: string;
  category?: string;
};

export type FoodProductsResponse = {
  products: FoodProduct[];
};
