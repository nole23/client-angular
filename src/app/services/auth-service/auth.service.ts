import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {Router} from '@angular/router';
import decode from 'jwt-decode';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class AuthService {

  admin;
  employee;
  tenant;
  supervisor;

  constructor(private http: HttpClient,
              private router: Router) {
  }


  registration_service(credentials) {
    return this.http.post('http://localhost:8080/api/users/sign_up', credentials)
      .map((res: any) => {
        console.log(res);
        return true;
      });
  }

  login_service(credentials): Observable<any> {
    return this.http.post('http://localhost:8080/api/users/sign_in', credentials)
      .map((res: any) => {
        // Method for decod JWT Token
        const tokenPayload = decode(res.jwt);
        this.admin = '';
        this.employee = '';
        this.tenant = '';
        this.supervisor = '';
        for (let i = 0; i < tokenPayload.userRoles.roles.length; i++) {
          if (tokenPayload.userRoles.roles[i] === 'ADMIN') {
            this.admin = 'ADMIN';
          }
          if (tokenPayload.userRoles.employees.length !== 0) {
            this.employee = 'EMPLOYEE';
          }
        }
        if (tokenPayload.userRoles.tenants.length !== 0) {
          this.tenant = 'TENANT';
        }
        const token = {
          'username': credentials.username,
          'roles': {
            'admin': this.admin,
            'employee': this.employee,
            'tenant': this.tenant
          },
          'tenants': tokenPayload.userRoles.tenants,
          'employees': tokenPayload.userRoles.employees,
          'jwt': res.jwt
        };
        localStorage.setItem('token', JSON.stringify(token));
        this.router.navigate(['/']);
        return res;
      });
  }

  logout_service() {
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
      this.router.navigate(['login']);
    }
  }

  getAllUsers(): Observable<any> {
    return this.http.get('http://localhost:8080/api/admins/users/');
  }

  getAllBuildings(): Observable<any> {
    return this.http.get('http://localhost:8080/api/buildings');
  }

  findFirm(): Observable<any> {
    return this.http.get('http://localhost:8080/api/firms/show');
  }
}
