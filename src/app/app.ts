import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, ConfirmDialog],
  providers: [MessageService, ConfirmationService],
  template: `
    <header style="background: var(--p-primary-color); color: var(--p-primary-contrast-color); padding: 1rem 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h1 style="margin: 0; font-size: 1.5rem;">Gadget Hub</h1>
    </header>
    <main style="padding: 2rem;">
      <router-outlet></router-outlet>
    </main>
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly title = signal('gadget-listing');
}
