import { Routes } from '@angular/router';
import { GadgetListComponent } from './features/gadget-list/gadget-list.component';
import { GadgetFormComponent } from './features/gadget-form/gadget-form.component';

export const routes: Routes = [
  { path: '', component: GadgetListComponent },
  { path: 'new', component: GadgetFormComponent },
  { path: 'edit/:id', component: GadgetFormComponent },
  { path: '**', redirectTo: '' }
];
