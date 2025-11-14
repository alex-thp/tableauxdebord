import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 🔹 AJOUT
import { HttpClient } from '@angular/common/http';
import { UserRoleEditorComponent } from '../user-role-editor/user-role-editor.component';

@Component({
  selector: 'app-user-role-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserRoleEditorComponent
  ],
  templateUrl: './user-role-management.component.html',
  styleUrls: ['./user-role-management.component.css']
})
export class UserRoleManagementComponent implements OnInit {
  users: any[] = [];
  edit: boolean = false;
  selectedUser: any = null;

  newUser = {
    email: '',
    password: '',
    roleId: null
  };

  availableRoles = [
    { id: 1, name: 'user' },
    { id: 2, name: 'admin' },
    { id: 3, name: 'manager' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
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
    this.selectedUser = {
      email: user.email,
      userId: user.id,
      roleId: user.roles[0]?.id
    };
    this.edit = true;
  }

  onRoleUpdate(event: { userId: number; roleId: number }) {
    this.http.put(`/api/user/${event.userId}/roles`, { roleId: event.roleId }).subscribe({
      next: () => {
        console.log('Rôle mis à jour !');
        this.edit = false;
        this.loadUsers();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du rôle', err);
        alert("Une erreur est survenue lors de la mise à jour du rôle.");
      }
    });
  }


  createUser() {
    if (!this.newUser.email || !this.newUser.password || !this.newUser.roleId) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    if (this.newUser.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    this.http.post('/api/user/create', this.newUser).subscribe({
      next: () => {
        alert('Utilisateur créé avec succès !');
        this.newUser = { email: '', password: '', roleId: null }; // réinitialisation
        this.loadUsers(); // recharger la liste
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la création de l’utilisateur.');
      }
    });
  }
}
