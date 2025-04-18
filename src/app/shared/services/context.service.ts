import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContextService {

  private $imageSelected: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private $exportImage: BehaviorSubject<number> = new BehaviorSubject(new Date().getTime());

  constructor() { }

  public imageSelected(): Observable<boolean> {
    return this.$imageSelected.asObservable();
  }

  public imageSelect(value: boolean): void {
    this.$imageSelected.next(value);
  }

  public exportImageEvent(): Observable<number> {
    return this.$exportImage.asObservable();
  }

  public exportImage(): void {
    this.$exportImage.next(new Date().getTime());
  }
}
