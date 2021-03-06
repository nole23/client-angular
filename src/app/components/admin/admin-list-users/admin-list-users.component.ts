import {Component, OnInit} from '@angular/core';

import {AdminService} from '../../../services/admin-service/admin.service';
import {ConfirmationService} from 'primeng/primeng';
import {Router} from '@angular/router';
import {AuthService} from '../../../services/auth-service/auth.service';

@Component({
  selector: 'app-admin-list-users',
  templateUrl: './admin-list-users.component.html',
  styleUrls: ['./admin-list-users.component.scss']
})
export class AdminListUsersComponent implements OnInit {

  users: any = [];
  messageAdd = false;
  messageRemove = false;
  progress = false;
  deleteDialog = false;
  currentTimeout;

  user: any;

  userToDelete;

  constructor(private adminService: AdminService,
              private confirmationService: ConfirmationService,
              private authService: AuthService) {
  }

  ngOnInit() {
    localStorage.setItem('sidebar', 'admin');
    localStorage.setItem('navbarTitle', 'Korisnici');
    this.user = JSON.parse(localStorage.getItem('token'));

    this.adminService.getAllUser().subscribe(res => {
      this.users = res;
    });
  }

  onAddAdmin(event) {
    this.adminService.addAdmin(event).subscribe(resp => {

      this.progress = true;

      this.currentTimeout = setTimeout(() => {
        this.adminService.getAllUser().subscribe(res => {
          this.users = res;
          this.messageAdd = true;
          this.messageRemove = false;
          this.progress = false;
        });
      }, 1000);
    });
  }

  onRemoveAdmin(event) {
    this.adminService.removeAdmin(event).subscribe(resp => {
      this.progress = true;

      this.currentTimeout = setTimeout(() => {
        this.adminService.getAllUser().subscribe(res => {
          this.users = res;
          this.messageAdd = false;
          this.messageRemove = true;
          this.progress = false;
        });
      }, 1000);
    });
  }

  openDeleteDialog(userUsername) {
    this.deleteDialog = true;
    this.userToDelete = userUsername;
    this.confirmationService.confirm({
      message: 'Da li ste sigurni da želite da obrišete korisnika?',
      header: 'Potvrda',
      icon: 'fa fa-question-circle'
    });
  }

  destroyUser() {
    this.adminService.deleteUser(this.userToDelete).subscribe(res => {
      this.adminService.getAllUser().subscribe(resp => {
        this.users = resp;
        this.deleteDialog = false;

        if (this.userToDelete === this.user.username) {
          this.authService.logout_service();
        }
      });
    });
  }

}
