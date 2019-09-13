import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedPendingFundsComponent } from './linked-pending-funds.component';

describe('PendingFundsComponent', () => {
  let component: LinkedPendingFundsComponent;
  let fixture: ComponentFixture<LinkedPendingFundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkedPendingFundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkedPendingFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
