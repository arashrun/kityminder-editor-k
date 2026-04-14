import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'zone.js';
import 'reflect-metadata';
import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
