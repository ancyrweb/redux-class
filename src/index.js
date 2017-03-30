let id = 0;
function createUniqueKey(key){
  return key + (id++).toString();
}

/**
 * Return a Map where keys are unique keys and values are the value they are generated from
 * This allow the reducer to have unique actionTypes, so they don't collide with any other reducer.
 *
 * @param actionMap
 * @returns {{}}
 */
function mapActionsToUniqueActionTypes(actionMap){
  const keys = Object.keys(actionMap);
  const namespacedNames = {};
  keys.forEach((key) => {
    namespacedNames[key] = createUniqueKey(key);
  });

  return namespacedNames;
}

/**
 * Generate
 * @param actionNameToActionType
 * @returns {{}}
 */
function generateActionCreatorsForMap(actionNameToActionType){
  const listOfUniqueActionTypes = Object.keys(actionNameToActionType);
  const userActions = {};

  listOfUniqueActionTypes.forEach((key) => {
    userActions[key] = function(args){
      return {type: actionNameToActionType[key], ...args }
    };
  });

  return userActions;
}

function ensureReturnedValueIsValid(value){
  if(value === undefined){
    throw new Error("A reducer may not return undefined")
  }
}

function ReducerBundle(obj){
  const mapActionToCallbacks = typeof obj.createUniqueActions === "function" ? obj.createUniqueActions() : {};

  if(typeof mapActionToCallbacks !== "object" || mapActionToCallbacks == false){
    throw new Error(
      "createUniqueAction should return an object, where each keys is " +
      "mapping to a reducer (e.g function(state, action){} )"
    )
  }

  const boundActions = typeof obj.bindActions === "function" ? obj.bindActions() : {};
  if(typeof boundActions !== "object" || boundActions == false){
    throw new Error(
      "bindActions should return an object, where each keys is " +
      "mapping to a reducer (e.g function(state, action){} )"
    )
  }

  const getInitialState = obj.getInitialState;

  const originalActionNamesToUniqueActionTypesMap = mapActionsToUniqueActionTypes(mapActionToCallbacks);
  const userActions = generateActionCreatorsForMap(originalActionNamesToUniqueActionTypesMap);

  const getCallbackForActionType = (actionType) => {
    for(let originalActionName in originalActionNamesToUniqueActionTypesMap){
      if(
        originalActionNamesToUniqueActionTypesMap.hasOwnProperty(originalActionName)
        && actionType === originalActionNamesToUniqueActionTypesMap[originalActionName]
      ){
        return mapActionToCallbacks[originalActionName];
      }
    }
  };

  const initObj = { type: "init" };

  this.actions = {
    ...userActions,
    init(){
      return initObj;
    }
  };

  if(typeof  getInitialState !== "function"){
    throw new Error("You must provide a getInitialState method");
  }

  const initialState = getInitialState();
  ensureReturnedValueIsValid(initialState);

  this.reduce = function(state = initialState, action){
    if(action === initObj){
      return initialState;
    }

    const callback = getCallbackForActionType(action.type);
    if(callback){
      const nextState = callback(state, action);
      ensureReturnedValueIsValid(nextState);

      return nextState;
    }

    if(boundActions[action.type]){
      return boundActions[action.type](state, action);
    }

    return state;
  }
}

export default {
  create(config){
    return new ReducerBundle(config);
  }
};