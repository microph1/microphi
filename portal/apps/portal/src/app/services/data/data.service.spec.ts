import { TestBed } from '@angular/core/testing';

import { DataService } from './data.service';

fdescribe('DataService', () => {
  let service: DataService;
  let storage;

  beforeEach(async () => {
    TestBed.configureTestingModule({});
    service = TestBed.get(DataService);
    expect(service).toBeTruthy();

    storage = service['db'];

    // await storage.destroy();
    spyOn(storage, 'put');
    spyOn(storage, 'post');
    spyOn(storage, 'allDocs');

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store an new item in a table', async () => {

    await service.save({
      title: 'sample-item'
    });
    expect(storage.post).toHaveBeenCalled();
    expect(storage.put).not.toHaveBeenCalled();

    // const docs = await storage.allDocs();
    // console.log(docs);
    // expect(docs).toBeTruthy();
  });

  it('should update an item the table', async () => {

    await service.save({
      _id: 'test-id',
      title: 'sample-2'
    });

    expect(storage.post).not.toHaveBeenCalled();
    expect(storage.put).toHaveBeenCalled();

  });

  it('should get all documents', async () => {
    await service.findAll({});
    expect(storage.allDocs).toHaveBeenCalled();
  });

});
