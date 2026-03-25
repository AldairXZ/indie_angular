import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishGame } from './publish-game';

describe('PublishGame', () => {
  let component: PublishGame;
  let fixture: ComponentFixture<PublishGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishGame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
