import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExampleCommonComponent } from './example-common.component';

describe('ExampleCommonComponent', () => {
  let component: ExampleCommonComponent;
  let fixture: ComponentFixture<ExampleCommonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleCommonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
