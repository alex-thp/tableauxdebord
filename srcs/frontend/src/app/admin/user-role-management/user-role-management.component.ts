import { Component } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { UserRoleEditorComponent } from '../user-role-editor/user-role-editor.component';

@Component({
  selector: 'app-user-role-management',
  imports: [CommonModule, UserRoleEditorComponent],
  templateUrl: './user-role-management.component.html',
  styleUrl: './user-role-management.component.css'
})
export class UserRoleManagementComponent implements OnInit {
  users: any[] = [];
  edit: boolean = false;
  selectedUser: any = null;
  availableRoles = [
    { id: 1, name: 'user' },
    { id: 2, name: 'admin' },
    { id: 3, name: 'manager' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get('/api/user/with-roles').subscribe((users: any) => {
      this.users = users.map((user: { roles: any[] }) => ({
        ...user,
        roleNames: user.roles.map(r => r.name).join(', '),
        permissionNames: user.roles
          .flatMap(r => r.permissions.map((p: { name: string }) => p.name))
          .filter((value, index, self) => self.indexOf(value) === index)
          .join(', '),
      }));
    });
  }

  editUser(user: any) {
    this.selectedUser = user;
    this.edit = !this.edit;
  }

  onRoleUpdate(event: { email: string; roleId: number }) {
    console.log('Mise à jour réussie pour:', event);
    this.edit = false;
    this.ngOnInit(); // recharge la liste des utilisateurs
  }
}
