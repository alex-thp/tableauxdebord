import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface RoleOption {
  id: number;
  name: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-user-role-editor',
  templateUrl: './user-role-editor.component.html',
})
export class UserRoleEditorComponent implements OnChanges {
  @Input() email: string = '';
  @Input() userId!: number;
  @Input() roleId: number | null = null;
  @Input() availableRoles: RoleOption[] = [];

  @Output() save = new EventEmitter<{ userId: number; roleId: number }>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: [
        { value: '', disabled: true },
        [Validators.required, Validators.email],
      ],
      roleId: [null, Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['email'] || changes['roleId']) {
      this.form.patchValue({ email: this.email, roleId: this.roleId });
    }
  }

  submit() {
    if (this.form.valid) {
      const roleId = this.form.value.roleId;

      if (roleId == null) {
        console.error('Rôle non sélectionné');
        return;
      }

      this.save.emit({
        userId: this.userId,
        roleId,
      });
    }
  }
}
