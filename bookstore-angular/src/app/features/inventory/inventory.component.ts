import { Component, OnInit, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductGridComponent } from './components/product-grid/product-grid.component';
import { ProductFormComponent, ProductFormData, ProductFormResult } from './components/product-form/product-form.component';
import { InventoryStore } from './inventory.store';
import { AuthService } from '../../core/auth/auth.service';
import { Product } from '../../core/models/product.model';

/**
 * Inventory component.
 * Main CRUD view for managing products.
 */
@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    TranslateModule,
    ProductGridComponent
  ],
  template: `
    <div class="inventory-container">
      <div class="toolbar">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'filter' | translate }}</mat-label>
          <input matInput
                 [value]="store.filter()"
                 (input)="onFilterChange($event)"
                 [placeholder]="'filter' | translate">
          <mat-icon matPrefix>search</mat-icon>
          @if (store.filter()) {
            <button mat-icon-button matSuffix (click)="clearFilter()">
              <mat-icon>clear</mat-icon>
            </button>
          }
        </mat-form-field>

        @if (isAdmin()) {
          <button mat-raised-button color="primary" (click)="onNewProduct()">
            <mat-icon>add</mat-icon>
            {{ 'new-product' | translate }}
          </button>
        }
      </div>

      @if (store.isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else if (store.errorMessage()) {
        <mat-card class="error-card">
          <mat-card-content>
            <mat-icon color="warn">error</mat-icon>
            <span>{{ store.errorMessage() }}</span>
            <button mat-button color="primary" (click)="store.loadProducts()">Retry</button>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card class="grid-card">
          <app-product-grid
            [products]="store.filteredProducts()"
            [selectedProduct]="store.selected()"
            (productSelected)="onProductSelected($event)">
          </app-product-grid>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .inventory-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .toolbar {
      display: flex;
      gap: 16px;
      align-items: center;

      .filter-field {
        flex: 1;
        max-width: 400px;
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .error-card {
      mat-card-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .grid-card {
      padding: 0;
    }
  `]
})
export class InventoryComponent implements OnInit {
  isAdmin = computed(() => this.authService.isAdmin());

  constructor(
    public store: InventoryStore,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.store.loadProducts();
    this.store.loadCategories();
  }

  /**
   * Keyboard shortcut: Ctrl+F to focus filter.
   */
  @HostListener('document:keydown.control.f', ['$event'])
  onFilterShortcut(event: KeyboardEvent): void {
    event.preventDefault();
    const input = document.querySelector('.filter-field input') as HTMLInputElement;
    input?.focus();
  }

  /**
   * Keyboard shortcut: Alt+N for new product.
   */
  @HostListener('document:keydown.alt.n', ['$event'])
  onNewProductShortcut(event: KeyboardEvent): void {
    if (this.isAdmin()) {
      event.preventDefault();
      this.onNewProduct();
    }
  }

  onFilterChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.setFilter(value);
  }

  clearFilter(): void {
    this.store.setFilter('');
  }

  onNewProduct(): void {
    this.store.createNewProduct();
    this.openProductForm();
  }

  onProductSelected(product: Product): void {
    this.store.selectProduct(product);
    this.openProductForm();
  }

  private openProductForm(): void {
    const product = this.store.selected();
    if (!product) return;

    const dialogData: ProductFormData = {
      product: { ...product, category: [...product.category] },
      categories: this.store.allCategories(),
      isAdmin: this.isAdmin()
    };

    const dialogRef = this.dialog.open(ProductFormComponent, {
      data: dialogData,
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: ProductFormResult | undefined) => {
      if (!result) {
        this.store.selectProduct(null);
        return;
      }

      switch (result.action) {
        case 'save':
          if (result.product) {
            const isNew = result.product.id < 0;
            this.store.saveProduct(result.product, () => {
              const msgKey = isNew ? 'messages.created' : 'messages.updated';
              const msg = this.translate.instant(msgKey, { name: result.product!.productName });
              this.snackBar.open(msg, 'OK', { duration: 3000 });
            });
          }
          break;

        case 'delete':
          if (result.product) {
            const productName = result.product.productName;
            this.store.deleteProduct(result.product.id, () => {
              const msg = this.translate.instant('messages.removed', { name: productName });
              this.snackBar.open(msg, 'OK', { duration: 3000 });
            });
          }
          break;

        case 'cancel':
        default:
          this.store.selectProduct(null);
          break;
      }
    });
  }
}

export default InventoryComponent;
