import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceFundsComponent } from './source-funds.component';

describe('SourceFundsComponent', () => {
  let component: SourceFundsComponent;
  let fixture: ComponentFixture<SourceFundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceFundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
