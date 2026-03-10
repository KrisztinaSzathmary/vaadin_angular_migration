import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { unsavedChangesGuard, HasUnsavedChanges } from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockCurrentState = {} as RouterStateSnapshot;
  const mockNextState = {} as RouterStateSnapshot;

  function runGuard(
    component: HasUnsavedChanges,
  ): boolean | ReturnType<typeof component.confirmDiscard> {
    return TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(component, mockRoute, mockCurrentState, mockNextState),
    );
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should allow navigation when there are no unsaved changes', () => {
    const component: HasUnsavedChanges = {
      hasUnsavedChanges: () => false,
      confirmDiscard: jest.fn(),
    };

    const result = runGuard(component);

    expect(result).toBe(true);
    expect(component.confirmDiscard).not.toHaveBeenCalled();
  });

  it('should call confirmDiscard when there are unsaved changes', () => {
    const component: HasUnsavedChanges = {
      hasUnsavedChanges: () => true,
      confirmDiscard: jest.fn().mockReturnValue(of(true)),
    };

    runGuard(component);

    expect(component.confirmDiscard).toHaveBeenCalled();
  });

  it('should block navigation when user cancels discard', (done) => {
    const component: HasUnsavedChanges = {
      hasUnsavedChanges: () => true,
      confirmDiscard: jest.fn().mockReturnValue(of(false)),
    };

    const result = runGuard(component);

    if (typeof result === 'boolean') {
      fail('Expected Observable, got boolean');
    } else {
      result.subscribe((allowed) => {
        expect(allowed).toBe(false);
        done();
      });
    }
  });

  it('should allow navigation when user confirms discard', (done) => {
    const component: HasUnsavedChanges = {
      hasUnsavedChanges: () => true,
      confirmDiscard: jest.fn().mockReturnValue(of(true)),
    };

    const result = runGuard(component);

    if (typeof result === 'boolean') {
      fail('Expected Observable, got boolean');
    } else {
      result.subscribe((allowed) => {
        expect(allowed).toBe(true);
        done();
      });
    }
  });
});
