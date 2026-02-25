import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  
  constructor(private router: Router) {
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('[Global Error Handler] Uncaught error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('[Global Error Handler] Unhandled promise rejection:', {
        reason: event.reason,
        promise: event.promise
      });
    });
  }

  handleError(error: any, context: string = 'Unknown'): void {
    console.error(`[Error Handler] Error in ${context}:`, error);
    console.log(`[Error Handler] Error details for ${context}:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context: context
    });
  }

  handleHttpError(error: any, context: string = 'HTTP Request'): void {
    console.error(`[Error Handler] HTTP error in ${context}:`, error);
    console.log(`[Error Handler] HTTP error details for ${context}:`, {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      error: error.error
    });
  }
}