import ReduxClass from '../src/index';
import { createStore, combineReducers } from 'redux';

const createReducer = () => ReduxClass.create({
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

it('should integrate into riducks', () => {
  const reducerBundle = createReducer();

  const store = createStore(reducerBundle.reduce);
  expect(store.getState()).toBe(0);

  store.dispatch(reducerBundle.actions.increment());
  expect(store.getState()).toBe(1);

  store.dispatch(reducerBundle.actions.add({ value: 2 }));
  expect(store.getState()).toBe(3);

  store.dispatch({ type: "substract", value: 2 });
  expect(store.getState()).toBe(1);

  store.dispatch(reducerBundle.actions.decrement());
  expect(store.getState()).toBe(0);
});

it('should dispatch unique actions for each reducer', () => {
  const reducer1 = createReducer();
  const reducer2 = createReducer();

  const store = createStore(combineReducers({
    counterA: reducer1.reduce,
    counterB: reducer2.reduce,
  }));

  expect(store.getState()).toEqual({
    counterA: 0,
    counterB: 0,
  });

  store.dispatch(reducer1.actions.increment());
  expect(store.getState()).toEqual({
    counterA: 1,
    counterB: 0,
  })

  store.dispatch(reducer1.actions.increment());
  store.dispatch(reducer2.actions.increment());
  expect(store.getState()).toEqual({
    counterA: 2,
    counterB: 1,
  });

  store.dispatch({ type: "substract", value: 1 });
  expect(store.getState()).toEqual({
    counterA: 1,
    counterB: 0,
  });

  store.dispatch(reducer2.actions.init());
  expect(store.getState()).toEqual({
    counterA: 1,
    counterB: 0,
  });
});
