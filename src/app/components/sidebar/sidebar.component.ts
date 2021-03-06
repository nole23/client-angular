import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth.service';
import { ActivatedRoute } from '@angular/router';

declare const $: any;

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}

export const ROUTES_ADMIN: RouteInfo[] = [
  { path: '/admin', title: 'Početna', icon: 'pe-7s-home', class: '' },
  { path: '/admin/users', title: 'Lista korisnika', icon: 'pe-7s-id', class: '' },
  { path: '/admin/buildings', title: 'Lista Zgrada', icon: 'pe-7s-culture', class: '' },
  { path: '/admin/firms', title: 'Lista Firmi', icon: 'pe-7s-config', class: '' },
  { path: '/admin/building', title: 'Dodavanje Zgrade', icon: 'pe-7s-door-lock', class: '' },
  { path: '/admin/firm', title: 'Dodavanje Firme', icon: 'pe-7s-plus', class: '' }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  menuItems: any[];
  menuRoles: any[];
  title = '';
  tenants_id;
  employee_id;
  ROUTES_TENANT: any[];
  ROUTES_SUPERVISOR: any[];
  ROLES: any[];
  ROUTES_EMPLOYEE: any[];

  constructor(private authService: AuthService, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    if (localStorage.getItem('sidebar')) {
      const sidebarType = localStorage.getItem('sidebar');
      const token = JSON.parse(localStorage.getItem('token'));
      this.setSidebarItems(sidebarType, token);
    }
  }

  // setting sidebar items based on entered role (roles: admin, employee, tenant)
  setSidebarItems(sidebarType, token) {

    if (sidebarType === 'admin') {
      this.menuItems = ROUTES_ADMIN;
      this.title = 'ADMIN PANEL';
    } else if (sidebarType === 'employee') {
      this.activeRoute.params.subscribe(params => {
        this.employee_id = (params['id']);
      });
      this.title = 'ZAPOSLENI';
      this.ROUTES_EMPLOYEE = [

        {path: '/employee/' + this.employee_id, title: 'Početna', icon: 'pe-7s-graph', class: ''},
        {path: '/employee/' + this.employee_id + '/list', title: 'Lista zaposlenih', icon: 'pe-7s-id', class: ''},
        {path: '/employee/' + this.employee_id + '/problems', title: 'Popravke', icon: 'pe-7s-note2', class: ''},
        {path: '/employee/' + this.employee_id + '/new', title: 'Dodati novog zaposlenog', icon: 'pe-7s-plus', class: ''}

      ];
      this.menuItems = this.ROUTES_EMPLOYEE;
    } else if (sidebarType === 'tenant') {
      this.title = 'STANAR';
      this.activeRoute.params.subscribe(params => {
        this.tenants_id = (params['id']);
      });
      this.ROUTES_TENANT = [
        { path: '/tenant/' + this.tenants_id, title: 'Početna', icon: 'pe-7s-home', class: '' },
        { path: '/tenant/' + this.tenants_id + '/problems', title: 'Kvarovi', icon: 'pe-7s-tools', class: '' },
        { path: '/tenant/' + this.tenants_id + '/surveys', title: 'Ankete', icon: 'pe-7s-news-paper', class: ''}

      ];
      for (const tenant of token.tenants) {
        if (tenant.tenant === this.tenants_id) {
          if (tenant.owner === 'true') {
            this.ROUTES_TENANT = this.ROUTES_TENANT.concat(
              { path: '/tenant/' + this.tenants_id + '/parliament', title: 'Skupština stanara', icon: 'pe-7s-hammer', class: '' },
            );
            if (tenant.supervisor) {
              this.ROUTES_TENANT = this.ROUTES_TENANT.concat(
               // { path: '/tenant/' + this.tenants_id, title: 'Predsedničko dugme', icon: 'pe-7s-piggy', class: '' },

              );
            }
          }
        }
      }

      this.menuItems = this.ROUTES_TENANT;
    } else if (sidebarType === 'user') {
      this.title = 'Vaš nalog';
    }
  }

  logout() {
    this.authService.logout_service();
  }

  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }

}
