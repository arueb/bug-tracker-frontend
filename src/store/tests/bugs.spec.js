import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  loadBugs,
  addBug,
  resolveBug,
  getUnresolvedBugs,
  assignBugToUser,
} from "../bugs";
import configureStore from "../configureStore";

describe("bugsSlice", () => {
  let fakeAxios;
  let store;
  beforeEach(() => {
    store = configureStore();
    fakeAxios = new MockAdapter(axios);
  });

  const bugsSlice = () => store.getState().entities.bugs;
  const createState = () => ({
    entities: {
      bugs: {
        list: [],
      },
    },
  });

  describe("adding bugs", () => {
    it("should add the bug to the store if saved to the server", async () => {
      // Arrange
      const bug = { description: "a" };
      const savedBug = { ...bug, id: 1 };
      fakeAxios.onPost("/bugs").reply(200, savedBug);

      // Act
      await store.dispatch(addBug(bug));

      // Assert
      expect(bugsSlice().list).toContainEqual(savedBug);
    });

    it("should not add the bug to the store if it's not saved to the server", async () => {
      // Arrange
      const bug = { description: "a" };
      fakeAxios.onPost("/bugs").reply(500);

      // Act
      await store.dispatch(addBug(bug));

      // Assert
      expect(bugsSlice().list).toHaveLength(0);
    });
  });

  describe("assigning bug to a user", () => {
    it("should add userid property if saved to server", async () => {
      fakeAxios.onPost("/bugs").reply(200, { id: 1 });
      fakeAxios.onPatch("/bugs/1").reply(200, { id: 1, userId: 1 });

      await store.dispatch(addBug({}));
      await store.dispatch(assignBugToUser(1, 1));

      expect(bugsSlice().list[0].userId).toBe(1);
    });

    it("should not add userid property if rejected from server", async () => {
      fakeAxios.onPost("/bugs").reply(200, { id: 1 });
      fakeAxios.onPatch("/bugs/1").reply(500);

      await store.dispatch(addBug({}));
      await store.dispatch(assignBugToUser(1, 1));

      expect(bugsSlice().list[0]).not.toHaveProperty("userId");
    });
  });
  describe("resolving bugs", () => {
    it("should mark the bug as resolved if saved to the server", async () => {
      //arrange
      fakeAxios.onPost("/bugs").reply(200, { id: 1, resolved: false });
      fakeAxios.onPatch("/bugs/1").reply(200, { id: 1, resolved: true });

      //act
      await store.dispatch(addBug({}));
      await store.dispatch(resolveBug(1));

      //assert
      expect(bugsSlice().list[0].resolved).toBe(true);
    });

    it("should not mark the bug as resolved if not saved to the server", async () => {
      //arrange
      fakeAxios.onPost("/bugs").reply(200, { id: 1, resolved: false });
      fakeAxios.onPatch("/bugs/1").reply(500);

      //act
      await store.dispatch(addBug({}));
      await store.dispatch(resolveBug(1));

      //assert
      expect(bugsSlice().list[0].resolved).not.toBe(true);
    });
  });

  describe("loading bugs", () => {
    describe("if the bugs exist in the cache", () => {
      it("they should not be fetched from the server again", async () => {
        fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }]);

        await store.dispatch(loadBugs()); // should make a get request
        await store.dispatch(loadBugs()); // should retrieve cached bugs

        expect(fakeAxios.history.get.length).toBe(1); // only one get request should have been made
      });
    });
    describe("if the bugs don't exist in the cache", () => {
      it("should be fetched from the server and put in the store", async () => {
        fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }]);

        await store.dispatch(loadBugs()); // should make a get request

        expect(bugsSlice().list).toHaveLength(1); // only one get request should have been made
      });

      describe("loading indicator", () => {
        it("should be true while fetching bugs", () => {
          // fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }]);
          fakeAxios.onGet(() => {
            // check loading property before reply from fake server
            expect(bugsSlice().loading).toBe(true);
            return [200, [{ id: 1 }]];
          });

          store.dispatch(loadBugs());
        });
        it("should be false after bugs are fetched", async () => {
          fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }]);

          await store.dispatch(loadBugs());

          expect(bugsSlice().loading).toBe(false);
        });
        it("should be false if server returns an error", async () => {
          fakeAxios.onGet("/bugs").reply(500);

          await store.dispatch(loadBugs());

          expect(bugsSlice().loading).toBe(false);
        });
      });
    });
    // it("Should add bugs to state if api call successful", async () => {
    //   fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }, { id: 2 }, { id: 3 }]);

    //   const result = await store.dispatch(loadBugs());
    //   console.log(result);
    //   expect(bugsSlice().list).toHaveLength(3);
    // });
  });

  describe("selectors", () => {
    it("getUnresolvedBugs", () => {
      const state = createState(); // fake state
      state.entities.bugs.list = [
        { id: 1, resolved: true },
        { id: 2, resolved: false },
        { id: 3 },
      ];

      const result = getUnresolvedBugs(state);

      expect(result).toHaveLength(2);
    });
  });
});
