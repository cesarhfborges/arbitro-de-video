import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContextService {

  private $imageSelected: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() { }

  public imageSelected(): Observable<boolean> {
    return this.$imageSelected.asObservable();
  }

  public imageSelect(value: boolean): void {
    this.$imageSelected.next(value);
  }
}
