import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatatanHamaPage } from './catatan-hama.page';

describe('CatatanHamaPage', () => {
  let component: CatatanHamaPage;
  let fixture: ComponentFixture<CatatanHamaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CatatanHamaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
