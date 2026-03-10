import { Availability } from './availability.enum';
import { Category } from './category.model';

export interface Product {
  id: number;
  productName: string;
  price: number;
  stockCount: number;
  availability: Availability;
  category: Category[];
}
