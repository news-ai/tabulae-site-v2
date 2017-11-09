import { generateConstants } from '../../constants/generateConstants';
import { commonTypes } from '../../constants/AppConstants';
export const searchConstant = generateConstants(commonTypes, 'SEARCH');
export const SEARCH_CLEAR_CACHE = 'SEARCH_CLEAR_CACHE';
