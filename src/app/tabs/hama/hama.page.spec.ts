import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HamaPage } from './hama.page';

describe('HamaPage', () => {
  let component: HamaPage;
  let fixture: ComponentFixture<HamaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HamaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
