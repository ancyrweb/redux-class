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


function ReducerBundle(obj){
  const mapActionToCallbacks = obj.createUniqueActions();
  const boundActions = obj.bindActions();
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

  this.reduce = function(state = getInitialState(), action){
    if(action === initObj){
      return getInitialState();
    }

    const callback = getCallbackForActionType(action.type);
    if(callback){
      return callback(state, action);
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