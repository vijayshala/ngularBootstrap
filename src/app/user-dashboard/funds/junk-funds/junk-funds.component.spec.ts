import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JunkFundsComponent } from './junk-funds.component';

describe('JunkFundsComponent', () => {
  let component: JunkFundsComponent;
  let fixture: ComponentFixture<JunkFundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JunkFundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JunkFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
