/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loans-account-edit-guarantor-dialog',
  templateUrl: './loans-account-edit-guarantor-dialog.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class LoansAccountEditGuarantorDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<LoansAccountEditGuarantorDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(UntypedFormBuilder);
  private loansService = inject(LoansService);
  private settingsService = inject(SettingsService);
  private dateUtils = inject(Dates);

  editGuarantorForm: UntypedFormGroup;
  relationTypes: any[] = [];
  minDate = new Date(1900, 0, 1);
  maxDate = new Date();

  ngOnInit() {
    this.dialogRef.updateSize('500px');
    this.maxDate = this.settingsService.businessDate;

    this.loansService.getGuarantorTemplate(this.data.loanId).subscribe((template: any) => {
      this.relationTypes = template.allowedClientRelationshipTypes || [];
    });

    const guarantor = this.data.guarantorData;
    this.editGuarantorForm = this.formBuilder.group({
      firstname: [guarantor.firstname || ''],
      lastname: [guarantor.lastname || ''],
      dob: [guarantor.dob ? new Date(guarantor.dob) : ''],
      addressLine1: [guarantor.addressLine1 || ''],
      addressLine2: [guarantor.addressLine2 || ''],
      city: [guarantor.city || ''],
      zip: [guarantor.zip || ''],
      mobileNumber: [guarantor.mobileNumber || ''],
      housePhoneNumber: [guarantor.housePhoneNumber || ''],
      clientRelationshipTypeId: [guarantor.clientRelationshipType?.id || '']
    });
  }

  submit() {
    const formData = this.editGuarantorForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;

    const data: any = {
      ...formData,
      locale,
      dateFormat,
      guarantorTypeId: this.data.guarantorData.guarantorType.id
    };

    if (formData.dob instanceof Date) {
      data['dob'] = this.dateUtils.formatDate(formData.dob, dateFormat);
    } else {
      delete data.dob;
    }

    this.loansService.updateGuarantor(this.data.loanId, this.data.guarantorData.id, data).subscribe(() => {
      this.dialogRef.close({ updated: true });
    });
  }
}
