import ReduxClass from '../src/index';

it('should work', function(){
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
