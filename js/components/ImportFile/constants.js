import {generateConstants} from 'constants/generateConstants';
import {commonTypes} from 'constants/AppConstants';

export const fileConstant = generateConstants(commonTypes, 'UPLOAD_FILE');
export const headerConstant = generateConstants(commonTypes, 'HEADERS');
export const REQUEST_HEADERS = 'REQUEST_HEADERS';
export const RECEIVE_HEADERS = 'RECEIVE_HEADERS';
export const TURN_ON_PROCESS_WAIT = 'TURN_ON_PROCESS_WAIT';
export const TURN_OFF_PROCESS_WAIT = 'TURN_OFF_PROCESS_WAIT';
