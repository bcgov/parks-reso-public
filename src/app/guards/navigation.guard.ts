import { CanDeactivateFn, UrlTree } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export type CanDeactivateType = Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;

export interface CanComponentDeactivate {
  canDeactivate: () => CanDeactivateType;
}

export const navigationGuard: CanDeactivateFn<CanComponentDeactivate> = (component: CanComponentDeactivate) => {
  console.log('NABIGATE');
  return component.canDeactivate ? component.canDeactivate() : true;
};