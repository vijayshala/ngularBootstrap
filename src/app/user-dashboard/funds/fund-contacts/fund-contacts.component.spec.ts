import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FundContactsComponent } from './fund-contacts.component';

describe('FundContactsComponent', () => {
  let component: FundContactsComponent;
  let fixture: ComponentFixture<FundContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FundContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
