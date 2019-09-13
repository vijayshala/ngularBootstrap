import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingFundsComponent } from './pending-funds.component';

describe('PendingFundsComponent', () => {
  let component: PendingFundsComponent;
  let fixture: ComponentFixture<PendingFundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingFundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
