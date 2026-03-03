import { Component, computed, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgClass } from '@angular/common';
import { Subject, debounceTime } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../models/product.model';
import { Availability } from '../../models/availability.enum';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  imports: [MatTableModule, MatSortModule, MatIconModule, MatButtonModule, NgClass],
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);
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
    this.dataSource.filterPredicate = (product: Product, filter: string): boolean => {
      const term = filter.toLowerCase();
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
  }

  onFilterInput(value: string): void {
    this.filterSubject.next(value);
  }

  onNewProduct(): void {
    // Placeholder – functionality will be implemented in Iteration 12
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
