import { Injectable, signal, computed } from '@angular/core';
import { Product, Category } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';

/**
 * Inventory store.
 * Signal-based state management for the inventory feature.
 */
@Injectable({
  providedIn: 'root'
})
export class InventoryStore {
  // State signals
  private products = signal<Product[]>([]);
  private categories = signal<Category[]>([]);
  private selectedProduct = signal<Product | null>(null);
  private filterText = signal<string>('');
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Computed signals
  readonly filteredProducts = computed(() => {
    const filter = this.filterText().toLowerCase().trim();
    if (!filter) {
      return this.products();
    }

    return this.products().filter(p =>
      p.productName.toLowerCase().includes(filter) ||
      p.availability.toLowerCase().includes(filter) ||
      p.category.some(c => c.name.toLowerCase().includes(filter))
    );
  });

  readonly allProducts = computed(() => this.products());
  readonly allCategories = computed(() => this.categories());
  readonly selected = computed(() => this.selectedProduct());
  readonly isLoading = computed(() => this.loading());
  readonly errorMessage = computed(() => this.error());
  readonly filter = computed(() => this.filterText());

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  /**
   * Load all products from the backend.
   */
  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load products');
        this.loading.set(false);
        console.error('Error loading products:', err);
      }
    });
  }

  /**
   * Load all categories from the backend.
   */
  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  /**
   * Save a product (create or update).
   * @param product Product to save
   * @param onSuccess Callback on success
   */
  saveProduct(product: Product, onSuccess?: () => void): void {
    this.loading.set(true);

    this.productService.save(product).subscribe({
      next: (saved) => {
        const current = this.products();
        const index = current.findIndex(p => p.id === saved.id);

        if (index >= 0) {
          // Update existing
          const updated = [...current];
          updated[index] = saved;
          this.products.set(updated);
        } else {
          // Add new
          this.products.set([...current, saved]);
        }

        this.loading.set(false);
        this.selectedProduct.set(null);
        onSuccess?.();
      },
      error: (err) => {
        this.error.set('Failed to save product');
        this.loading.set(false);
        console.error('Error saving product:', err);
      }
    });
  }

  /**
   * Delete a product.
   * @param id Product ID
   * @param onSuccess Callback on success
   */
  deleteProduct(id: number, onSuccess?: () => void): void {
    this.loading.set(true);

    this.productService.delete(id).subscribe({
      next: () => {
        const current = this.products();
        this.products.set(current.filter(p => p.id !== id));
        this.loading.set(false);
        this.selectedProduct.set(null);
        onSuccess?.();
      },
      error: (err) => {
        this.error.set('Failed to delete product');
        this.loading.set(false);
        console.error('Error deleting product:', err);
      }
    });
  }

  /**
   * Set filter text for product search.
   * @param text Filter text
   */
  setFilter(text: string): void {
    this.filterText.set(text);
  }

  /**
   * Select a product for editing.
   * @param product Product to select or null to deselect
   */
  selectProduct(product: Product | null): void {
    this.selectedProduct.set(product);
  }

  /**
   * Create a new empty product.
   */
  createNewProduct(): void {
    const newProduct: Product = {
      id: -1,
      productName: '',
      price: 0,
      stockCount: 0,
      availability: 'COMING',
      category: []
    };
    this.selectedProduct.set(newProduct);
  }

  /**
   * Clear any error message.
   */
  clearError(): void {
    this.error.set(null);
  }
}
