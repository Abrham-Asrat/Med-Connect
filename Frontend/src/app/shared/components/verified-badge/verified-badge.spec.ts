import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifiedBadge } from './verified-badge';

describe('VerifiedBadge', () => {
  let component: VerifiedBadge;
  let fixture: ComponentFixture<VerifiedBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifiedBadge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifiedBadge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
