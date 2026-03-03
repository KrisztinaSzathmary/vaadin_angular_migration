import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { NgClass } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../models/product.model';
import { Availability } from '../../models/availability.enum';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  imports: [MatTableModule, MatSortModule, NgClass],
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

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

  @ViewChild(MatSort) set matSort(sort: MatSort) {
    if (sort) {
      this.dataSource.sort = sort;
    }
  }

  ngOnInit(): void {
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
