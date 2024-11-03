import { ReplaySubject, filter } from 'rxjs';
import { Server } from 'socket.io';
import { io as ioClient } from 'socket.io-client';
import { ClientSide, RpcClient } from './RpcClient';
import { RpcServer, ServerSide } from './RpcServer';


describe(`

#RpcServer

Implementing an RPC pattern with socket.io:


`, () => {

    type Peer = string;

    interface RpcInterface {
      // request a RPC from client to server and receive response
      joinCluster(id: string): Peer[];
    }


    class TestServer extends RpcServer<RpcInterface> implements ServerSide<RpcInterface> {

      onJoinCluster(id: string) {
        console.log('executing onJoinCluster', id);
        return [id];
      }

    }

    class TestClient extends RpcClient<RpcInterface> implements ClientSide<RpcInterface> {

      joined$ = new ReplaySubject<string[]>();

      onJoinCluster(peers: string[]): void {
        console.log('received response from web socket server');
        console.log('connected peers', peers);
        this.joined$.next(peers);
      }
    }


    let server: TestServer;
    let client: TestClient;

    beforeEach( async () => {

      const io = new Server(56566);

      server = new TestServer(io);

      client = new TestClient(ioClient('http://localhost:56566'));
      await client.connected;

    });

    afterEach(() => {

      client.disconnect();
      server.close();

    });

    it('should create server', (done) => {

      expect(server).toBeTruthy();
      expect(client).toBeTruthy();

      client.connected$.pipe(filter((isConnected) => isConnected)).subscribe(() => {
        expect(client.io.connected).toBeTruthy();
        done();
      });

    });


    it('should dispatch an event to the server', (done) => {

      client.dispatch('joinCluster', 'peer-id');


      client.joined$.subscribe((peers) => {

        expect(peers).toEqual(['peer-id']);
        done();
      });


    });

});

// describe('test', () => {
//
//   it('should pass', () => {
//     const tickets = [8, 5, 4, 8, 4].sort();
//
//     const subsequencies: number[][] = [];
//
//     let subsequence: number[] = [];
//
//     for (let index = 0; index < tickets.length; index++) {
//       const value = tickets[index];
//       const nextValue = tickets[index + 1];
//       const diff = Math.abs(value - nextValue);
//
//       subsequence.push(value);
//
//       if (!(diff <= 1)) {
//         subsequencies.push(subsequence);
//         subsequence = [];
//       }
//
//     }
//
//     const mValues = subsequencies.map((v) => v.length);
//     const max = Math.max(...mValues);
//
//     expect(max).toEqual(3);
//
//
//   });
//
// });
