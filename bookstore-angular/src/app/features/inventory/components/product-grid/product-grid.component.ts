import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Product, Availability } from '../../../../core/models/product.model';

/**
 * Product grid component.
 * Displays products in a sortable, paginated table.
 */
@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatTooltipModule,
    TranslateModule
  ],
  template: `
    <div class="table-container">
      <table mat-table [dataSource]="dataSource" matSort class="product-table">
        <!-- Product Name Column -->
        <ng-container matColumnDef="productName">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'product-name' | translate }}</th>
          <td mat-cell *matCellDef="let product" [matTooltip]="product.productName">
            {{ product.productName }}
          </td>
        </ng-container>

        <!-- Price Column -->
        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-right">{{ 'price' | translate }}</th>
          <td mat-cell *matCellDef="let product" class="text-right">
            {{ product.price | currency:'EUR':'symbol':'1.2-2' }}
          </td>
        </ng-container>

        <!-- Availability Column -->
        <ng-container matColumnDef="availability">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'availability' | translate }}</th>
          <td mat-cell *matCellDef="let product">
            <span class="availability-badge" [ngClass]="getAvailabilityClass(product.availability)">
              <mat-icon class="availability-icon">{{ getAvailabilityIcon(product.availability) }}</mat-icon>
              {{ getAvailabilityLabel(product.availability) }}
            </span>
          </td>
        </ng-container>

        <!-- Stock Count Column -->
        <ng-container matColumnDef="stockCount">
          <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-right">{{ 'in-stock' | translate }}</th>
          <td mat-cell *matCellDef="let product" class="text-right">
            {{ product.stockCount }}
          </td>
        </ng-container>

        <!-- Categories Column -->
        <ng-container matColumnDef="categories">
          <th mat-header-cell *matHeaderCellDef>{{ 'categories' | translate }}</th>
          <td mat-cell *matCellDef="let product">
            {{ getCategoryNames(product) }}
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"
            [class.selected]="selectedProduct?.id === row.id"
            (click)="onRowClick(row)">
        </tr>
      </table>

      <mat-paginator [pageSizeOptions]="[10, 25, 50]"
                     showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .table-container {
      overflow: auto;
    }

    .product-table {
      width: 100%;
    }

    .text-right {
      text-align: right;
    }

    tr.mat-mdc-row {
      cursor: pointer;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &.selected {
        background-color: rgba(103, 126, 234, 0.1);
      }
    }

    .availability-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;

      &.available {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      &.coming {
        background-color: #fff3e0;
        color: #ef6c00;
      }

      &.discontinued {
        background-color: #ffebee;
        color: #c62828;
      }
    }

    .availability-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  `]
})
export class ProductGridComponent implements AfterViewInit {
  @Input() set products(value: Product[]) {
    this.dataSource.data = value;
  }

  @Input() selectedProduct: Product | null = null;
  @Output() productSelected = new EventEmitter<Product>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = ['productName', 'price', 'availability', 'stockCount', 'categories'];
  dataSource = new MatTableDataSource<Product>([]);

  constructor(private translate: TranslateService) {}

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  onRowClick(product: Product): void {
    this.productSelected.emit(product);
  }

  getAvailabilityClass(availability: Availability): string {
    return availability.toLowerCase();
  }

  getAvailabilityIcon(availability: Availability): string {
    switch (availability) {
      case 'AVAILABLE':
        return 'check_circle';
      case 'COMING':
        return 'schedule';
      case 'DISCONTINUED':
        return 'cancel';
      default:
        return 'help';
    }
  }

  getAvailabilityLabel(availability: Availability): string {
    switch (availability) {
      case 'AVAILABLE':
        return this.translate.instant('availability-status.available');
      case 'COMING':
        return this.translate.instant('availability-status.coming');
      case 'DISCONTINUED':
        return this.translate.instant('availability-status.discontinued');
      default:
        return availability;
    }
  }

  getCategoryNames(product: Product): string {
    return product.category.map(c => c.name).join(', ');
  }
}
