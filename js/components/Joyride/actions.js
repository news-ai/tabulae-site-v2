import {
  TURN_ON_UPLOAD_GUIDE,
  TURN_OFF_UPLOAD_GUIDE,
  TURN_ON_GENERAL_GUIDE,
  TURN_OFF_GENERAL_GUIDE,
  FORWARD_STEP,
  BACKWARD_STEP
} from './constants';

export function turnOnUploadGuide() {
  return {type: TURN_ON_UPLOAD_GUIDE};
}

export function turnOffUploadGuide() {
  return {type: TURN_OFF_UPLOAD_GUIDE};
}

export function turnOnGeneralGuide() {
  return {type: TURN_ON_GENERAL_GUIDE};
}

export function turnOffGeneralGuide() {
  return {type: TURN_OFF_GENERAL_GUIDE};
}
