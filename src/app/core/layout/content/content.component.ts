import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-content',
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
  standalone: true,
})
export class ContentComponent {}
