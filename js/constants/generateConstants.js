
// generate common action constants like ACTION_REQUEST, ACTION_RECEIVE, ACTION_REQUEST_FAIL
export function generateConstants(commonTypes, parentName) {
  const obj = {};
  commonTypes.map( name => obj[name] = `${parentName}_${name}`);
  return obj;
}
