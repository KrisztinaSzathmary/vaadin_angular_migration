/**
 * Product entity model.
 * Mirrors the Java Product class from backend.
 */
export interface Product {
  id: number;
  productName: string;
  price: number;
  stockCount: number;
  availability: Availability;
  category: Category[];
}

/**
 * Category entity model.
 */
export interface Category {
  id: number;
  name: string;
}

/**
 * Availability enum.
 * Matches the Java Availability enum.
 */
export type Availability = 'COMING' | 'AVAILABLE' | 'DISCONTINUED';

/**
 * User model for authentication.
 */
export interface User {
  username: string;
  role: 'admin' | 'user';
}

/**
 * Login request DTO.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response DTO.
 */
export interface LoginResponse {
  token: string;
  username: string;
  role: 'admin' | 'user';
  expiresIn: number;
}
