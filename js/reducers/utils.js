
export function canAccessReducer(actionType, availableTypes) {
  return availableTypes.some( type => type === actionType );
}
