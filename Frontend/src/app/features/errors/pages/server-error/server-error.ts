import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-server-error',
  imports: [],
  templateUrl: './server-error.html',
  styleUrl: './server-error.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerError {

}
