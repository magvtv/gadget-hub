import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Gadget } from '../models/gadget.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GadgetService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private readonly STORAGE_KEY = 'my_gadget_ids';

  private getStoredIds(): string[] {
    if (typeof localStorage === 'undefined') return [];
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private addStoredId(id: string): void {
    if (typeof localStorage === 'undefined') return;
    const ids = this.getStoredIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ids));
    }
  }

  private removeStoredId(id: string): void {
    if (typeof localStorage === 'undefined') return;
    const ids = this.getStoredIds();
    const newIds = ids.filter(i => i !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newIds));
  }

  getGadgets(): Observable<Gadget[]> {
    const defaultList$ = this.http.get<Gadget[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );

    const storedIds = this.getStoredIds();
    if (storedIds.length === 0) {
      return defaultList$;
    }

    let params = new HttpParams();
    storedIds.forEach(id => {
      params = params.append('id', id);
    });

    const myList$ = this.http.get<Gadget[]>(this.apiUrl, { params }).pipe(
      catchError(() => of([]))
    );

    return forkJoin([defaultList$, myList$]).pipe(
      map(([defaultList, myList]) => {
        const merged = [...myList, ...defaultList];
        const unique = merged.filter((obj, pos, arr) => 
          arr.findIndex(o => o.id === obj.id) === pos
        );
        return unique;
      })
    );
  }

  getGadget(id: string): Observable<Gadget> {
    return this.http.get<Gadget>(`${this.apiUrl}/${id}`);
  }

  addGadget(gadget: Omit<Gadget, 'id'>): Observable<Gadget> {
    return this.http.post<Gadget>(this.apiUrl, gadget).pipe(
      tap(created => {
        if (created.id) this.addStoredId(created.id);
      })
    );
  }

  updateGadget(id: string, gadget: Partial<Gadget>): Observable<Gadget> {
    return this.http.put<Gadget>(`${this.apiUrl}/${id}`, gadget);
  }

  deleteGadget(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.removeStoredId(id))
    );
  }
}

