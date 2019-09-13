import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportSettingComponent } from './export-setting.component';

describe('ExportSettingComponent', () => {
  let component: ExportSettingComponent;
  let fixture: ComponentFixture<ExportSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
