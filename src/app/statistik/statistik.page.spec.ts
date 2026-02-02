import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatistikPage } from './statistik.page';

describe('StatistikPage', () => {
  let component: StatistikPage;
  let fixture: ComponentFixture<StatistikPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StatistikPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
