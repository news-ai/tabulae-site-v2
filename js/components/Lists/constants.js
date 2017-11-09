import {generateConstants} from 'constants/generateConstants';
import {commonTypes} from 'constants/AppConstants';
export const ARCHIVE_LIST = 'ARCHIVE_LIST';
export const ARCHIVE_LIST_FINISHED = 'ARCHIVE_LIST_FINISHED';
export const LIST_CONTACTS_SEARCH_REQUEST = 'LIST_CONTACTS_SEARCH_REQUEST';
export const LIST_CONTACTS_SEARCH_RECEIVED = 'LIST_CONTACTS_SEARCH_RECEIVED';
export const LIST_CONTACTS_SEARCH_FAIL = 'LIST_CONTACTS_SEARCH_FAIL';
export const listConstant = generateConstants(commonTypes, 'LIST');
