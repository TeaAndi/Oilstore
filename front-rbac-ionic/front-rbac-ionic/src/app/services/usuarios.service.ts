import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type DbRole = 'db_datareader' | 'db_datawriter' | 'db_owner';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  crearLogin(username: string, password: string, dbRole: DbRole): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/usuarios/crear-login`, {
      username,
      password,
      dbRole,
    });
  }
}
