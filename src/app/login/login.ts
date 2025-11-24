import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {LoginResourceService} from './login-resource-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private loginResourceService = inject(LoginResourceService);
  private router = inject(Router);

  form: FormGroup = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });
  isRegisterMode = false;

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    const request$ = this.isRegisterMode
      ? this.loginResourceService.register(payload)
      : this.loginResourceService.login(payload);

    request$.subscribe(login => {
      localStorage.setItem('token', login.data.token);
      this.router.navigate(['task']);
    });
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }
}
