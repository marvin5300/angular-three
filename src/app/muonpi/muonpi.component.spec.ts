import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuonpiComponent } from './muonpi.component';

describe('MuonpiComponent', () => {
  let component: MuonpiComponent;
  let fixture: ComponentFixture<MuonpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MuonpiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuonpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
