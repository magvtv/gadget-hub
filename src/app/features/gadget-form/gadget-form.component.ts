import { Component, inject, ChangeDetectionStrategy, signal, input, output, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { GadgetService } from '../../core/services/gadget.service';
import { Gadget } from '../../core/models/gadget.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-gadget-form',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  template: `
    <form [formGroup]="gadgetForm" (ngSubmit)="saveGadget()" style="display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <label for="name" style="font-weight: 500;">Name</label>
        <input pInputText id="name" formControlName="name" />
        @if (gadgetForm.get('name')?.invalid && gadgetForm.get('name')?.touched) {
          <small class="error" style="color: var(--p-red-500);">Name is required.</small>
        }
      </div>
      
      <div [formGroup]="dataForm" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
        <h4 style="margin: 0;">Data Attributes</h4>
        
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <label for="cpuModel">CPU Model</label>
          <input pInputText id="cpuModel" formControlName="CPU model" />
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <label for="capacity">Capacity</label>
          <input pInputText id="capacity" formControlName="capacity" />
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem;">
        <p-button label="Cancel" severity="secondary" (click)="onCancel()" type="button"></p-button>
        <p-button [label]="gadgetToEdit() ? 'Update' : 'Create'" (click)="saveGadget()" [disabled]="gadgetForm.invalid" type="submit"></p-button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GadgetFormComponent {
  private gadgetService = inject(GadgetService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  gadgetToEdit = input<Gadget | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  dataForm = this.fb.group({
    'CPU model': [''],
    'capacity': ['']
  });

  gadgetForm = this.fb.group({
    name: ['', Validators.required],
    data: this.dataForm
  });

  constructor() {
    effect(() => {
      const gadget = this.gadgetToEdit();
      if (gadget) {
        this.gadgetForm.patchValue({
          name: gadget.name,
          data: gadget.data || {}
        });
      } else {
        this.gadgetForm.reset();
      }
    });
  }

  saveGadget(): void {
    if (this.gadgetForm.invalid) return;

    const formValue = this.gadgetForm.value;
    const gadget = this.gadgetToEdit();
    
    // Explicitly cast the form variables to match GadgetData
    const payload: Omit<Gadget, 'id'> = {
      name: formValue.name!,
      data: formValue.data ? { ...formValue.data } : null
    };

    if (gadget && gadget.id) {
      this.gadgetService.updateGadget(gadget.id, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Gadget updated successfully' });
          this.saved.emit();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update gadget' })
      });
    } else {
      this.gadgetService.addGadget(payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Gadget created successfully' });
          this.saved.emit();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create gadget' })
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
