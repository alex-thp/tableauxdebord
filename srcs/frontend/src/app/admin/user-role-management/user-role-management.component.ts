import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserRoleEditorComponent } from '../user-role-editor/user-role-editor.component';
import { GatewayService } from '../../gateway.service';

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

  // Gestion du changement de mot de passe admin
  adminPasswordEditUserId: number | null = null;
  adminNewPassword: string = '';

  newUser: { email: string; password: string; roleId: number } = {
    email: '',
    password: '',
    roleId: 0
  };

  availableRoles = [
    { id: 1, name: 'user' },
    { id: 2, name: 'admin' },
    { id: 3, name: 'manager' }
  ];

  constructor(private gateway: GatewayService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.gateway.getUsersWithRoles().subscribe((users: any[]) => {
      this.users = users.map(user => ({
        ...user,
        roleNames: user.roles.map((r: { name: any; }) => r.name).join(', '),
        permissionNames: user.roles
          .flatMap((r: { permissions: any[]; }) => r.permissions.map((p: any) => p.name))
          .filter((v: any, i: any, self: string | any[]) => self.indexOf(v) === i)
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
    this.gateway.updateUserRole(event.userId, event.roleId).subscribe({
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

    this.gateway.createUser(this.newUser).subscribe({
      next: () => {
        alert('Utilisateur créé avec succès !');
        this.newUser = { email: '', password: '', roleId: 0 };
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la création de l’utilisateur.');
      }
    });
  }

  deleteUser(userId: number) {
    const confirmDelete = confirm("Voulez-vous vraiment supprimer cet utilisateur ?");
    if (!confirmDelete) return;

    this.gateway.deleteUser(userId).subscribe({
      next: () => {
        alert("Utilisateur supprimé avec succès.");
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de la suppression du compte.");
      }
    });
  }

  openPasswordEditor(userId: number) {
    this.adminPasswordEditUserId = userId;
    this.adminNewPassword = '';
  }

  adminChangePassword() {
    if (!this.adminNewPassword || this.adminNewPassword.length < 6) {
      alert("Nouveau mot de passe trop court.");
      return;
    }

    this.gateway.adminChangePassword(this.adminPasswordEditUserId!, this.adminNewPassword).subscribe({
      next: () => {
        alert("Mot de passe changé avec succès !");
        this.adminPasswordEditUserId = null;
        this.adminNewPassword = '';
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors du changement de mot de passe.");
      }
    });
  }

  cancelAdminPasswordEdit() {
    this.adminPasswordEditUserId = null;
    this.adminNewPassword = '';
  }
}
