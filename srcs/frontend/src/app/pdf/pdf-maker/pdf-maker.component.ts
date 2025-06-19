import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { GatewayService } from '../../gateway.service';

@Component({
  selector: 'app-pdf-maker',
  templateUrl: './pdf-maker.component.html',
  styleUrls: ['./pdf-maker.component.css'],
  imports: [FormsModule],
})
export class PdfMakerComponent {
  fileOriginal!: File;
  fileInsert!: File;

  formData = {
    fromFile1: 1,
    toFile1: 1,
    fromFile2: 1,
    toFile2: 1,
  };

  constructor(private http: HttpClient, private gatewayService: GatewayService) {}

  onFileChange(event: Event, type: 'original' | 'insert') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (type === 'original') {
        this.fileOriginal = input.files[0];
      } else {
        this.fileInsert = input.files[0];
      }
    }
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('files', this.fileOriginal);
    formData.append('files', this.fileInsert);
    formData.append('fromFile1', this.formData.fromFile1.toString());
    formData.append('toFile1', this.formData.toFile1.toString());
    formData.append('fromFile2', this.formData.fromFile2.toString());
    formData.append('toFile2', this.formData.toFile2.toString());


    this.gatewayService.mergePdf(formData).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    }, error => {
      console.error('Erreur lors de la fusion du PDF :', error);
    });
  }
}
