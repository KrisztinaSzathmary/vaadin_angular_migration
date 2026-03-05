import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialogRefSpy: jest.Mocked<MatDialogRef<ConfirmDialogComponent>>;

  function setup(data: ConfirmDialogData): void {
    dialogRefSpy = { close: jest.fn() } as unknown as jest.Mocked<
      MatDialogRef<ConfirmDialogComponent>
    >;

    TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    });

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup({ message: 'Test message' });
    expect(component).toBeTruthy();
  });

  it('should display the message', () => {
    setup({ message: "'Test Book' will be deleted." });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain("'Test Book' will be deleted.");
  });

  it('should display Confirm title', () => {
    setup({ message: 'Test' });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Confirm');
  });

  it('should close with true on confirm', () => {
    setup({ message: 'Delete?' });
    component.onConfirm();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should close without result on cancel', () => {
    setup({ message: 'Delete?' });
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should render Cancel and Confirm buttons', () => {
    setup({ message: 'Test' });
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const buttonTexts = Array.from(buttons).map((b) => (b as HTMLElement).textContent?.trim());
    expect(buttonTexts).toContain('Cancel');
    expect(buttonTexts).toContain('Confirm');
  });
});
