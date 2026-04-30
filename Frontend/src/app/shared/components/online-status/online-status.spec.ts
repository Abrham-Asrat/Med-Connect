import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineStatus } from './online-status';

describe('OnlineStatus', () => {
  let component: OnlineStatus;
  let fixture: ComponentFixture<OnlineStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlineStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
