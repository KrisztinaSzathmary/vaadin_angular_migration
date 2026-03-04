import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBarSpy: jest.Mocked<MatSnackBar>;

  beforeEach(() => {
    snackBarSpy = { open: jest.fn() } as unknown as jest.Mocked<MatSnackBar>;

    TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: snackBarSpy }],
    });

    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call snackBar.open on showSuccess', () => {
    service.showSuccess('Product saved');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Product saved', 'Close', { duration: 3000 });
  });

  it('should use 3000ms duration for showSuccess', () => {
    service.showSuccess('Done');
    const options = snackBarSpy.open.mock.calls[0][2];
    expect(options?.duration).toBe(3000);
  });

  it('should call snackBar.open on showError', () => {
    service.showError('Save failed');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Save failed', 'Close', { duration: 5000 });
  });

  it('should use 5000ms duration for showError', () => {
    service.showError('Error');
    const options = snackBarSpy.open.mock.calls[0][2];
    expect(options?.duration).toBe(5000);
  });
});
