import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display "The view could not be found."', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('The view could not be found.');
  });

  it('should display search_off icon', () => {
    const icon = fixture.nativeElement.querySelector('mat-icon');
    expect(icon).toBeTruthy();
    expect(icon.textContent.trim()).toBe('search_off');
  });

  it('should center content', () => {
    const container = fixture.nativeElement.querySelector('.flex');
    expect(container).toBeTruthy();
    expect(container.classList.contains('items-center')).toBe(true);
    expect(container.classList.contains('justify-center')).toBe(true);
  });
});
