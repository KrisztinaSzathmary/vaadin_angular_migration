import { Component, computed, inject, OnInit, signal, VERSION } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product } from '../../models/product.model';
import { Availability } from '../../models/availability.enum';

export interface TechLink {
  label: string;
  value: string;
  url: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  imports: [DecimalPipe, MatIconModule],
})
export class AboutComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  readonly products = signal<Product[]>([]);
  readonly categoryCount = signal(0);
  readonly loading = signal(true);

  readonly totalProducts = computed(() => this.products().length);
  readonly availableProducts = computed(
    () => this.products().filter((p) => p.availability === Availability.AVAILABLE).length,
  );
  readonly totalStock = computed(() => this.products().reduce((sum, p) => sum + p.stockCount, 0));

  readonly angularVersion = VERSION.full;

  readonly systemInfo: { label: string; value: string }[] = [
    { label: 'Environment', value: 'Production' },
    { label: 'Version', value: 'v1.1-SNAPSHOT' },
    { label: 'Build date', value: new Date().toISOString().split('T')[0] },
    { label: 'Runtime', value: `Angular ${VERSION.major}` },
  ];

  readonly techInfo: TechLink[] = [
    { label: 'Framework', value: `Angular ${VERSION.major}`, url: 'https://angular.dev' },
    {
      label: 'UI Library',
      value: 'Angular Material 20',
      url: 'https://material.angular.io',
    },
    {
      label: 'Styling',
      value: 'Tailwind CSS 4',
      url: 'https://tailwindcss.com',
    },
    {
      label: 'Language',
      value: 'TypeScript 5.9',
      url: 'https://www.typescriptlang.org',
    },
  ];

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });

    this.categoryService.getAll().subscribe({
      next: (categories) => this.categoryCount.set(categories.length),
    });
  }
}
