import { Component, computed, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { NgClass } from '@angular/common';
import { Subject, debounceTime, filter, forkJoin, of } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  ProductFormComponent,
  ProductFormData,
  ProductDeletedResult,
} from './product-form.component';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Availability } from '../../models/availability.enum';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  imports: [MatTableModule, MatSortModule, MatIconModule, MatButtonModule, NgClass, RouterOutlet],
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly filterText = signal('');
  readonly isAdmin = this.authService.isAdmin;

  readonly availableCount = computed(
    () => this.products().filter((p) => p.availability === Availability.AVAILABLE).length,
  );
  readonly comingCount = computed(
    () => this.products().filter((p) => p.availability === Availability.COMING).length,
  );
  readonly discontinuedCount = computed(
    () => this.products().filter((p) => p.availability === Availability.DISCONTINUED).length,
  );

  readonly dataSource = new MatTableDataSource<Product>();
  readonly displayedColumns = ['productName', 'price', 'availability', 'stockCount', 'categories'];

  private readonly filterSubject = new Subject<string>();
  private dialogOpen = false;

  @ViewChild(MatSort) set matSort(sort: MatSort) {
    if (sort) {
      this.dataSource.sort = sort;
    }
  }

  constructor() {
    this.filterSubject
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.filterText.set(value);
        this.dataSource.filter = value.trim().toLowerCase();
      });
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (product: Product, filterValue: string): boolean => {
      const term = filterValue.toLowerCase();
      return (
        product.productName.toLowerCase().includes(term) ||
        this.formatAvailability(product.availability).toLowerCase().includes(term) ||
        product.category.some((c) => c.name.toLowerCase().includes(term))
      );
    };

    this.productService.getAll().subscribe({
      next: (data) => {
        this.products.set(data);
        this.dataSource.data = data;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load products');
        this.loading.set(false);
      },
    });

    this.categoryService.getAll().subscribe({
      next: (cats) => this.categories.set(cats),
    });

    // Subscribe to router events for URL-based dialog opening
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        const idParam = this.extractIdFromUrl(event.urlAfterRedirects);
        if (idParam) {
          this.handleRouteParam(idParam);
        }
      });

    // Handle initial URL on component load
    const initialId = this.extractIdFromUrl(this.router.url);
    if (initialId) {
      this.handleRouteParam(initialId);
    }
  }

  onFilterInput(value: string): void {
    this.filterSubject.next(value);
  }

  onNewProduct(): void {
    this.router.navigate(['/inventory', 'new']);
  }

  onRowClick(product: Product): void {
    if (this.isAdmin()) {
      this.router.navigate(['/inventory', product.id]);
    }
  }

  extractIdFromUrl(url: string): string | null {
    const match = url.match(/\/inventory\/([^?#/]+)/);
    return match ? match[1] : null;
  }

  private handleRouteParam(idParam: string): void {
    if (this.dialogOpen) {
      return;
    }

    if (idParam === 'new') {
      if (!this.isAdmin()) {
        this.router.navigate(['/inventory']);
        return;
      }
      this.openProductDialogFromRoute(null);
      return;
    }

    const id = Number(idParam);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
      this.notificationService.showError(`Invalid product ID: '${idParam}'`);
      this.router.navigate(['/inventory']);
      return;
    }

    this.openProductById(id);
  }

  private openProductById(id: number): void {
    const categories$ =
      this.categories().length > 0 ? of(this.categories()) : this.categoryService.getAll();

    forkJoin({
      product: this.productService.getById(id),
      categories: categories$,
    }).subscribe({
      next: ({ product, categories }) => {
        this.categories.set(categories);
        this.openProductDialogFromRoute(product);
      },
      error: () => {
        this.notificationService.showError(`Product with ID ${id} not found`);
        this.router.navigate(['/inventory']);
      },
    });
  }

  private openProductDialogFromRoute(product: Product | null): void {
    this.dialogOpen = true;

    const data: ProductFormData = {
      product,
      categories: this.categories(),
    };

    const dialogRef = this.dialog.open(ProductFormComponent, {
      data,
      width: '520px',
    });

    dialogRef.afterClosed().subscribe((result?: Product | ProductDeletedResult) => {
      this.dialogOpen = false;
      this.router.navigate(['/inventory']);

      if (result) {
        this.refreshProducts();
        if ('deleted' in result) {
          this.notificationService.showSuccess(`'${result.productName}' removed`);
        } else {
          const message = product ? 'Product updated' : 'Product created';
          this.notificationService.showSuccess(message);
        }
      }
    });
  }

  private refreshProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products.set(data);
        this.dataSource.data = data;
      },
    });
  }

  formatAvailability(availability: Availability): string {
    switch (availability) {
      case Availability.AVAILABLE:
        return 'Available';
      case Availability.COMING:
        return 'Coming';
      case Availability.DISCONTINUED:
        return 'Discontinued';
    }
  }

  availabilityColor(availability: Availability): string {
    switch (availability) {
      case Availability.AVAILABLE:
        return 'bg-available';
      case Availability.COMING:
        return 'bg-coming';
      case Availability.DISCONTINUED:
        return 'bg-discontinued';
    }
  }

  formatCategories(product: Product): string {
    return product.category.map((c) => c.name).join(', ');
  }
}
