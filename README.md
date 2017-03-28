# Redux-Class

Bringing class-style reducer factory to your redux stack.

```js
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

```

## Installation

Simply run `npm install --save redux-class`

## Motivation

Writing reducers can be annoying, it takes time to create actionTypes, and actions, and to put it all
into a switch. The imperative style of treating the action using condtionnal is hard to grasp.
ReduxClass propose a more declarative way to create your reducers using a class-looking approach. You don't have to
take care of the assignation logic, you just describe what action leads to what function.

**Pros :**
* Easy to understand even **for those who don't know about redux**
* Go straight to your logic without caring about reducer boilerplate (actionCreator, actionTypes..)
* Functions are reusable, **they are just reducer themselves !**

**Cons :**
* Map one action to one function, but you can call other functions within it
* A bit less control over your reducer (since the reducer is generated)

### API

#### ReduxClass.create (config: Object) => { actions: { [key: string]: Function }, reduce: Function }

Create the object holding the reducer.
* **reducer** : the function that will handle the reducer logic and return a state given an action
* **actions** : actions to dispatch. They are all functions ! There is one function by default, **init**, which reinitialize the state

##### createUniqueActions () => { [key: string]: Function }
Return a map whose keys are going to be the actions (you call from yourClass.actions) and whose
values are functions to call when we dispatch this action.
**Those actions are unique, which mean that calling them will only affect the current reducer.**

##### bindActions () => { [key: string]: Function }
Same as createUniqueAction, except the key is a general-purpose key.
**Those actions are global, so every reducer will respond to them if the action given as key is dispatched.**

##### getInitialState () => mixed
Return the reducer initial state.


