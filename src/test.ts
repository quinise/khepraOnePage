// src/test.ts
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Use the Angular CLI's global require context for all spec files.
const allTests = (window as any)['__karma__']?.files || {};
Object.keys(allTests)
  .filter((path) => path.endsWith('.spec.ts'))
  .forEach((path) => {
    require(path);
  });
