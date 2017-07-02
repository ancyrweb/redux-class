import ReduxClass from '../src/index';

it('should handle basic logic', () => {
  const reducerBundle = ReduxClass.create({
    increment(state){
      return state + 1;
    },
    decrement(state){
      return state - 1;
    },
    add(state, { value }){
      return state + value;
    },
    substract(state, { value }){
      return state - value;
    },
    createUniqueActions(){
      return {
        increment: this.increment,
        decrement: this.decrement,
        add: this.add,
      }
    },
    bindActions(){
      return {
        "substract": this.substract,
      }
    },
    getInitialState(){
      return 0;
    }
  });

  const state = reducerBundle.reduce(null, reducerBundle.actions.init());
  expect(state).toBe(0);

  const state2 = reducerBundle.reduce(state, reducerBundle.actions.increment());
  expect(state2).toBe(1);

  const state3 = reducerBundle.reduce(state2, reducerBundle.actions.decrement());
  expect(state3).toBe(0);

  const state4 = reducerBundle.reduce(state3, reducerBundle.actions.add({ value: 3 }));
  expect(state4).toBe(3);

  const state5 = reducerBundle.reduce(state4, { type: "substract", value: 2});
  expect(state5).toBe(1);
});

describe('checking for common errors', () => {
  it('should allow creating without specifying bindActions', () => {
    expect(() => {
      ReduxClass.create({
        increment(state){
          return state + 1;
        },
        decrement(state){
          return state - 1;
        },
        createUniqueActions(){
          return {
            increment: this.increment,
            decrement: this.decrement,
          }
        },
        getInitialState(){
          return 0;
        }
      });
    }).not.toThrow();
  });

  describe('getInitialState', () => {
    it('should throw when returning undefined from getInitialState', () => {
      expect(() => {
        ReduxClass.create({
          increment(state){
            return state + 1;
          },
          createUniqueActions(){
            return {
              increment: this.increment,
            }
          },
          getInitialState(){

          }
        });
      }).toThrowError("A reducer may not return undefined");
    });

    it('should throw when getInitialState is not defined', () => {
      expect(() => {
        ReduxClass.create({
          increment(state){
            return state + 1;
          },
          createUniqueActions(){
            return {
              increment: this.increment,
            }
          },
        });
      }).toThrowError("You must provide a getInitialState method");
    });
  });

  describe('createUniqueActions', () => {
    it('should disallow not returning an object from createUniqueActions', () => {
      expect(() => {
        ReduxClass.create({
          increment(state){
            return state + 1;
          },
          decrement(state){
            return state - 1;
          },
          createUniqueActions(){

          },
          getInitialState(){
            return 0;
          }
        });
      }).toThrowError(
        "createUniqueAction should return an object, where each keys is " +
        "mapping to a reducer (e.g function(state, action){} )"
      );
    });

    it('should throw when a reducer returns undefined', () => {
      expect(() => {
        const reducerBundle = ReduxClass.create({
          thisShouldThrow(){

          },
          createUniqueActions(){
            return {
              thisShouldThrow: this.thisShouldThrow,
            }
          },
          getInitialState(){
            return 0;
          }
        });

        reducerBundle.reduce(0, reducerBundle.actions.thisShouldThrow());
      }).toThrowError("A reducer may not return undefined");
    });
  });

  describe('bindActions', () => {
    it('should throw when bindAction returns nothing', () => {
      expect(() => {
        ReduxClass.create({
          increment(state){
            return state + 1;
          },
          decrement(state){
            return state - 1;
          },
          bindActions(){

          },
          getInitialState(){
            return 0;
          }
        });
      }).toThrowError(
        "bindActions should return an object, where each keys is " +
        "mapping to a reducer (e.g function(state, action){} )"
      );
    });
  });
});
