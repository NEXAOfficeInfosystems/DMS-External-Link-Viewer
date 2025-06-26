import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioPreviewComponent } from './audio-preview.component';

describe('AudioPreviewComponent', () => {
  let component: AudioPreviewComponent;
  let fixture: ComponentFixture<AudioPreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AudioPreviewComponent]
    });
    fixture = TestBed.createComponent(AudioPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
