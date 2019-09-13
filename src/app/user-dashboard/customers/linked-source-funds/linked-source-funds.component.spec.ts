import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedSourceFundsComponent } from './linked-source-funds.component';

describe('SourceFundsComponent', () => {
  let component: LinkedSourceFundsComponent;
  let fixture: ComponentFixture<LinkedSourceFundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkedSourceFundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkedSourceFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
