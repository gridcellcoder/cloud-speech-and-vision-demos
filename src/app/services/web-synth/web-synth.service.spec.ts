import { inject, fakeAsync, tick, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { WebSynthService } from '../index';

describe('WebSynthService', () => {
  let fakeTestObject: any = { dummy: 1 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WebSynthService,
      ]
    });
  });

  describe('start', () => {
    it('should start recognizing and return observable',
      inject([WebSynthService], fakeAsync((service: WebSynthService) => {
        let spy = spyOn((<any>service).engine, 'start');
        let observable = service.start();
        tick();

        expect(spy).toHaveBeenCalled();
        expect(observable).toEqual(jasmine.any(Observable));
      }))
    );
  });

});
