// import { TestScheduler } from '@datakitchen/rxjs-marbles';
// import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
// import { JsonStorage } from './json-storage';

// describe('json-storage', () => {
//   interface User {
//     id: string;
//     name: string;
//   }
//
//   let storage: JsonStorage<User>;
//
//   let scheduler: TestScheduler;
//
//   beforeEach(() => {
//
//     if (existsSync('.data')) {
//       rmSync('.data', {recursive: true});
//     }
//
//     // TODO: fill in some initial data
//
//     const user0 = { id: '0', name: 'user0' };
//     const timestamp = new Date().toISOString();
//     const index = [{id: '0', path: '.data/users/0.json', created: timestamp, modified: timestamp}];
//
//     if (!existsSync('.data')) {
//       mkdirSync('.data');
//     }
//
//     if (!existsSync('.data/users')) {
//       mkdirSync('.data/users');
//     }
//
//     // create entity file
//     writeFileSync('.data/users/0.json', JSON.stringify(user0), { flag: 'wx' });
//     // create index file
//     writeFileSync('.data/users/index.json', JSON.stringify(index), { flag: 'wx' });
//
//     scheduler = new TestScheduler();
//
//     storage = new JsonStorage<User>('users', '.data', {
//       fields: ['name'],
//       idField: 'id',
//     }, 0, scheduler);
//   });
//
//
//   it('should exists', () => {
//     expect(storage).toBeTruthy();
//   });
//
//   it('should have loaded stored data', () => {
//
//     expect(storage.getCount()).toEqual(1);
//   });
//
//
//   it('initialize minisearch', () => {
//     const results = storage.search('anything');
//     expect(results).toEqual([]);
//   });
//
//   describe('storing documents', () => {
//     beforeEach(async () => {
//       await storage.upsert({id: '1', name: 'superman'});
//     });
//
//     it('should have updated the index', () => {
//       expect(storage.has('1')).toBeTruthy();
//     });
//
//     it('should update index.json file', async () => {
//
//       // manually force saveIndex index for now
//       // I can't find a better way to check this
//       await storage.saveIndex();
//       const indexFile = readFileSync('.data/users/index.json', 'utf8');
//       const data = JSON.parse(indexFile);
//       expect(data).toEqual(expect.arrayContaining([{
//         created: expect.anything(),
//         modified: expect.anything(),
//         id: '1',
//         path: '.data/users/1.json',
//       }]));
//
//
//     });
//
//     it('should create a new file for the document', () => {
//
//       expect(existsSync('.data/users/1.json')).toBeTruthy();
//       const file = readFileSync('.data/users/1.json', 'utf8');
//       const data = JSON.parse(file);
//       expect(data).toEqual({
//         id: '1', name: 'superman',
//       });
//     });
//
//     it('should count the number of documents stored', () => {
//       expect(storage.getCount()).toEqual(2);
//     });
//
//     it('get all documents', async () => {
//
//       const docs = await storage.getAll();
//
//       expect(docs).toEqual(expect.arrayContaining([{id: '1', name: 'superman'}]));
//     });
//
//     it('remove a document', async () => {
//
//       await storage.remove('1');
//
//       expect(storage.getCount()).toEqual(1);
//       expect(existsSync('.data/users/1.json')).toBeFalsy();
//
//     });
//
//
//     it('remove all documents', async () => {
//
//       await storage.deleteAll();
//       expect(storage.getCount()).toEqual(0);
//       expect(existsSync('.data/users/1.json')).toBeFalsy();
//     });
//
//     describe('update a document', () => {
//
//       it('update an existing document', async () => {
//
//         await storage.upsert({id: '0', name: 'super-superman'});
//         const user = await storage.get('0');
//         expect(user).toEqual({id: '0', name: 'super-superman'});
//       });
//
//       it('update entity updated field while conserving created field', async () => {
//         const idx = storage.index.get('0');
//
//         expect(idx).toEqual({
//           created: expect.anything(),
//           modified: expect.anything(),
//           id: expect.anything(),
//           path: expect.anything(),
//         });
//
//         await storage.upsert({id: '0', name: 'super-superman-1'});
//         expect(storage.index.get('0')?.created).toEqual(idx?.created);
//         expect(storage.index.get('0')?.modified).not.toEqual(idx?.modified);
//
//
//       });
//
//     });
//   });
//
//   describe('retrieve a document', () => {
//
//     it('should retrieve a document from disk if exists', async () => {
//
//       await storage.upsert({id: '2', name: 'batman'});
//
//       const hero = await storage.get('2');
//       expect(hero).toEqual({id: '2', name: 'batman'});
//
//     });
//
//     it('should return undefined if a document does not exists', async () => {
//
//       const hero = await storage.get('2');
//       expect(hero).toEqual(undefined);
//     });
//
//   });
//
//   describe('#search', () => {
//
//     it('should search for a document using minisearch', () => {
//
//
//     });
//
//
//   });
//
// });


fdescribe('kanepa technical', () => {

  xit('should pass', () => {
    expect(true).toBeTruthy();

    function getUniqueChar(text: string) {
      const counter = {};
      for (let index = 0; index < text.length; index++) {
        const char = text[index];
        console.log({char});

        const currentCounter = counter[char];

        if (!currentCounter) {

          counter[char] = { count: 1, position: index+1 };
        } else {
          counter[char] = { count: currentCounter.count + 1, position: currentCounter.position };
        }

      }

      console.log(counter);

      const char = Object.entries(counter).find(([, counter]) => {

        // @ts-ignore
        return counter.count === 1;
      });

      if (!char) {
        return -1;
      }
        // @ts-ignore
      // console.log(char[1].position);

      return char[1].position;
    }


    getUniqueChar('hackthegame');

  });

  it('maximum profit', () => {
    expect(true).toBeTruthy();


    function maximumProfit(price: number[]) {
      const actions: any[] = [];

      const max = Math.max(...price);
      console.log({max});

      const maxIndexes = price.map((value, idx) => {
        if (value === max) { return idx; }
        else { return undefined; }
      }).filter((value) => value !== undefined);


      console.log({maxIndexes});
      // I can disregard all max values that happen in the middle
      const lastMaxIndex = maxIndexes.pop() || 0;
      console.log({lastMaxIndex});


      for (let index = 0; index < price.length - 1; index++) {

        const currentValue = price[index];


        if (currentValue < max && lastMaxIndex > index) {

          actions.push([index, 'buy']);
        } else if (currentValue === max) {

          actions.push([index, 'stay']);
        }


      }


      if (lastMaxIndex !== 0) {

        // @ts-ignore
        actions[lastMaxIndex] = [lastMaxIndex, 'sell'];

        console.log({actions});
      }


      // i need to buy every on every idx before maxIndexes if the stock price at each step is lower then max
      //
      // for (let index = 0; index <= ; index++) {
      //   const element = array[index];
      //
      // }

      let maxProfix = 0;

      let numberOfStocks = 0;
      for (let index = 0; index < actions.length; index++) {
        const [idx, action] = actions[index];

        if (action === 'buy') {
          console.log('buying 1 stock at', price[idx]);
          maxProfix += -1 * price[idx];
          numberOfStocks += 1;
        }
        console.log({idx, action, maxProfix, numberOfStocks});


        if (action === 'stay') {
          // do nothing
        }

        if (action === 'sell' && price[idx] === max) {

          maxProfix += numberOfStocks * price[idx];
          numberOfStocks = 0;
        }

      }

      console.log({maxProfix});
      return maxProfix;

    }

    expect(
      maximumProfit([3, 4, 5, 3, 5, 2])
    ).toEqual(5);


    console.log('-------------------');
    expect(
      maximumProfit([5, 3, 2])
    ).toEqual(0);
    console.log('-------------------');
    maximumProfit([1, 2, 100]);

    expect(maximumProfit([1, 2, 100])).toEqual(197);

  });



});
