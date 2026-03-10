import { Component, computed, inject, OnInit, signal, VERSION } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product } from '../../models/product.model';
import { Availability } from '../../models/availability.enum';

export interface TechLink {
  labelKey: string;
  value: string;
  url: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  imports: [DecimalPipe, MatIconModule, TranslatePipe],
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

  readonly systemInfo: { labelKey: string; value: string }[] = [
    { labelKey: 'ABOUT.SYSTEM_ENVIRONMENT', value: 'ABOUT.SYSTEM_ENVIRONMENT_VALUE' },
    { labelKey: 'ABOUT.SYSTEM_VERSION', value: 'v1.1-SNAPSHOT' },
    { labelKey: 'ABOUT.SYSTEM_BUILD_DATE', value: new Date().toISOString().split('T')[0] },
    { labelKey: 'ABOUT.SYSTEM_RUNTIME', value: `Angular ${VERSION.major}` },
  ];

  readonly techInfo: TechLink[] = [
    {
      labelKey: 'ABOUT.TECH_FRAMEWORK',
      value: `Angular ${VERSION.major}`,
      url: 'https://angular.dev',
    },
    {
      labelKey: 'ABOUT.TECH_UI_LIBRARY',
      value: 'Angular Material 20',
      url: 'https://material.angular.io',
    },
    {
      labelKey: 'ABOUT.TECH_STYLING',
      value: 'Tailwind CSS 4',
      url: 'https://tailwindcss.com',
    },
    {
      labelKey: 'ABOUT.TECH_LANGUAGE',
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
