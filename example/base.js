import ReduxClass from '../src/index';

const reducerBundle = ReduxClass.create({
  // Write your logic here
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
  // Configure the reducer here
  createUniqueActions(){
    // We return an object where keys are going to be used as action
    return {
      increment: this.increment,
      decrement: this.decrement,
      add: this.add,
    }
  },
  bindActions(){
    // We bind general action to be handled
    return {
      "substract": this.substract,
    }
  },
  getInitialState(){
    return 0;
  }
});

let state = reducerBundle.reduce(null, reducerBundle.actions.init()); // state = 0
state = reducerBundle.reduce(state, reducerBundle.actions.increment()); // state = 1
state = reducerBundle.reduce(state, reducerBundle.actions.decrement()); // state = 0
state = reducerBundle.reduce(state, reducerBundle.actions.add({ value: 3 })); // state = 3
state = reducerBundle.reduce(state, { type: "substract", value: 2}); // state = 1
