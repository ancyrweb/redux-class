// @flow

let id : number = 0;
function generateID() : number {
  return id++;
}

export type ReducerType = (state : mixed, action : { type: string }) => mixed;

export type ReducerBundleType = {
  reduce: ReducerType,
  actions: {[key: string]: () => { type: string }},
}

export type BundleConfigType = {
  createUniqueActions?: () => {[key: string] : ReducerType },
  bindActions?: () => ReducerType,
  getInitialState: () => mixed,
}

/**
 * Return a Map where keys are unique keys and values are the value they are generated from
 * This allow the reducer to have unique actionTypes, so they don't collide with any other reducer.
 *
 * @param actionMap
 * @returns {{}}
 */
function toUniqueTypes(actionMap){
  const keys = Object.keys(actionMap);
  const namespacedNames = {};
  const id = generateID();

  keys.forEach((key) => {
    namespacedNames[key] = key + id;
  });

  return namespacedNames;
}

/**
 * Generate
 * @param functionNameToActionType
 * @returns {{}}
 */
function toActionCreator(functionNameToActionType){
  const functionNames = Object.keys(functionNameToActionType);
  const actions = {};

  functionNames.forEach((functionName) => {
    actions[functionName] = function(args){
      return {type: functionNameToActionType[functionName], ...args }
    };
  });

  return actions;
}

/**
 * Throws an error if the value is undefined
 * @param value
 */
function ensureValueIsNotUndefined(value : any) : void {
  if(value === undefined) throw new Error("A reducer may not return undefined");
}


function createReducerBundle(config : BundleConfigType) : ReducerBundleType {
  const mapActionToCallbacks = typeof config.createUniqueActions === "function" ? config.createUniqueActions() : {};

  if(typeof mapActionToCallbacks !== "object" || !mapActionToCallbacks){
    throw new Error(
      "createUniqueAction should return an object, where each keys is " +
      "mapping to a reducer (e.g function(state, action){} )"
    )
  }

  const boundActions = typeof config.bindActions === "function" ? config.bindActions() : {};
  if(typeof boundActions !== "object" || !boundActions){
    throw new Error(
      "bindActions should return an object, where each keys is " +
      "mapping to a reducer (e.g function(state, action){} )"
    )
  }

  const getInitialState = config.getInitialState;

  const functionList = toUniqueTypes(mapActionToCallbacks);
  const userActions = toActionCreator(functionList);

  const getCallback = (actionType) => {
    for(let originalActionName in functionList){
      if(functionList.hasOwnProperty(originalActionName) && actionType === functionList[originalActionName]){
        return mapActionToCallbacks[originalActionName];
      }
    }
  };

  const initObj = { type: "init" };

  if(typeof getInitialState !== "function"){
    throw new Error("You must provide a getInitialState method");
  }

  const initialState = getInitialState();
  ensureValueIsNotUndefined(initialState);

  return {
    actions: {
      ...userActions,
      init(){
        return initObj;
      }
    },
    reduce(state : mixed = initialState, action : { type: string }) : mixed {
      if(action === initObj){
        return initialState;
      }

      const callback = getCallback(action.type);
      if(callback){
        const nextState = callback(state, action);
        ensureValueIsNotUndefined(nextState);
        return nextState;
      }

      if(boundActions[action.type]){
        return boundActions[action.type](state, action);
      }

      return state;
    }
  }
}

module.exports = {
  create(config : BundleConfigType){
    return createReducerBundle(config);
  }
};