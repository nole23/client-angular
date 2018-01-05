import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AdminGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) { }

  canActivate() {
    if (localStorage.getItem('token')) {
      return true;
    }
    return false;
  }

  canActivateChild(route: ActivatedRouteSnapshot) {
  	const expectedRole = route.data.expectedRole;
  	const token = JSON.parse(localStorage.getItem('token'));
  	if (expectedRole === token.roles.admin ) {
  		console.log('ADMIN je');
  		return true;
  	}
  	if (expectedRole === token.roles.employee ) {
  		console.log('EMPLOYEE je');
  		return true;
  	}
  	if (expectedRole === token.roles.tenant ) {
  		console.log('TENANT je');
  		return true;
  	}
  	if (expectedRole === token.roles.supervisor ) {
  		console.log('SUPERVISOR je');
  		return true;
  	}
  	return false;
  }
}
