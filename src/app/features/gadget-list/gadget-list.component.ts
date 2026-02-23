import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { GadgetService } from '../../core/services/gadget.service';
import { Gadget } from '../../core/models/gadget.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GadgetFormComponent } from '../gadget-form/gadget-form.component';

@Component({
  selector: 'app-gadget-list',
  imports: [KeyValuePipe, TableModule, ButtonModule, DialogModule, GadgetFormComponent],
  template: `
    <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
      <h2 style="margin: 0;">Gadgets</h2>
      <p-button label="Add Gadget" icon="pi pi-plus" (click)="openNew()"></p-button>
    </div>

    <p-table [value]="gadgets()" [tableStyle]="{ 'min-width': '50rem' }" [rows]="10" [paginator]="true">
        <ng-template #header>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Data</th>
                <th style="width: 10rem">Actions</th>
            </tr>
        </ng-template>
        <ng-template #body let-gadget>
            <tr>
                <td>{{ gadget.id }}</td>
                <td>{{ gadget.name }}</td>
                <td>
                  @if (gadget.data) {
                    <ul style="margin: 0; padding-left: 1rem;">
                      @for (item of gadget.data | keyvalue; track item.key) {
                        <li><strong>{{ item.key }}:</strong> {{ item.value }}</li>
                      }
                    </ul>
                  } @else {
                    <span style="color: #888;">N/A</span>
                  }
                </td>
                <td>
                    <p-button icon="pi pi-pencil" severity="info" [text]="true" [rounded]="true" (click)="editGadget(gadget)"></p-button>
                    <p-button icon="pi pi-trash" severity="danger" [text]="true" [rounded]="true" (click)="deleteGadget(gadget)"></p-button>
                </td>
            </tr>
        </ng-template>
        <ng-template #empty>
            <tr>
                <td colspan="4">No gadgets found.</td>
            </tr>
        </ng-template>
    </p-table>

    <p-dialog [(visible)]="displayDialog" [header]="selectedGadget() ? 'Edit Gadget' : 'Add Gadget'" [modal]="true" [style]="{ width: '25rem' }">
      <app-gadget-form [gadgetToEdit]="selectedGadget()" (saved)="onSaved()" (cancelled)="hideDialog()"></app-gadget-form>
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GadgetListComponent implements OnInit {
  private gadgetService = inject(GadgetService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  gadgets = signal<Gadget[]>([]);
  displayDialog = signal(false);
  selectedGadget = signal<Gadget | null>(null);

  ngOnInit(): void {
    this.loadGadgets();
  }

  loadGadgets(): void {
    this.gadgetService.getGadgets().subscribe({
      next: (data) => this.gadgets.set(data),
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load gadgets' })
    });
  }

  openNew() {
    this.selectedGadget.set(null);
    this.displayDialog.set(true);
  }

  editGadget(gadget: Gadget) {
    this.selectedGadget.set(gadget);
    this.displayDialog.set(true);
  }

  hideDialog() {
    this.displayDialog.set(false);
  }

  onSaved() {
    this.hideDialog();
    this.loadGadgets();
  }

  deleteGadget(gadget: Gadget): void {
    if (!gadget.id) return;
    
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this gadget?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.gadgetService.deleteGadget(gadget.id!).subscribe({
          next: () => {
             this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Gadget deleted successfully' });
             this.loadGadgets();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete gadget' })
        });
      }
    });
  }
}

