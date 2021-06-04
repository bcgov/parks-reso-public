import { ViewContainerRef, ComponentFactoryResolver, Injectable, Type, ComponentRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InjectComponentService {
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  /**
   * Inject the provided component into the provided view.
   *
   * @param {ViewContainerRef} viewContainerRef
   * @param {Type<any>} componentToInject
   * @returns {ComponentRef<any>}
   * @memberof InjectComponentService
   */
  injectComponentIntoView(viewContainerRef: ViewContainerRef, componentToInject: Type<any>): ComponentRef<any> {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentToInject);
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(componentFactory);

    return componentRef;
  }
}
