import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/main/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
