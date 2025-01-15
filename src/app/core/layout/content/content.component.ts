import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { IndexComponent } from '../index/index.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-content',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, IndexComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
  standalone: true,
})
export class ContentComponent {}
