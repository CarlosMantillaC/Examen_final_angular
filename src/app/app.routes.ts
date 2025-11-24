import { Routes } from '@angular/router';
import {Login} from './login/login';
import {Task} from './task/task';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'task',
    component: Task
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
