import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../user.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-user-role-editor',
  templateUrl: './user-role-editor.component.html',
})
export class UserRoleEditorComponent implements OnChanges {
  @Input() email: string = '';
  @Input() role: string = '';
  @Input() availableRoles: { id: number, name: string }[] = [];

  @Output() save = new EventEmitter<{ email: string; roleId: number }>();

  form: FormGroup;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.form = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      role: ['', Validators.required],
    });
  }

  ngOnChanges(): void {
    this.form.patchValue({ email: this.email, role: this.role });
  }

  submit() {
    if (this.form.valid) {
      const selectedRoleName = this.form.value.role;
      const selectedRole = this.availableRoles.find(r => r.name === selectedRoleName);

      if (!selectedRole) {
        console.error('Rôle non trouvé');
        return;
      }

      this.userService.getUserByEmail(this.email).subscribe(user => {
        const userId = user.id;

        this.userService.updateUserRoles(userId, selectedRole.id).subscribe({
          next: () => this.save.emit({ email: this.email, roleId: selectedRole.id }),
          error: err => console.error('Erreur de mise à jour du rôle :', err),
        });
      });
    }
  }
}
