import draftRawToHtml from '../draftRawToHtml';
import {
  testJson1,
  testResult1,
  testJson2,
  testResult2,
  testJson3,
  testResult3,
  testJson4,
  testResult4,
  testJson5,
  testResult5,
  testJson6,
  testResult6,
  testJson7,
  testResult7,
  testJson8,
  testResult8,
} from './sampleTemplates';

const escapeHtml = html => html.replace(/"/g, "&quot;").replace(/'/g, "\\'").replace(/\n/g, '\\n');


test('basic template with 2 paragraphs', () => {
  expect(draftRawToHtml(testJson1)).toBe(testResult1);
});

test('complex template with differnt font-sizes, bold, italic, images, and link entities', () => {
  expect(escapeHtml(draftRawToHtml(testJson2))).toBe(escapeHtml(testResult2));
});

test('basic template with 3 grafs of different alignments: left, middle, right', () => {
  expect(escapeHtml(draftRawToHtml(testJson3))).toBe(escapeHtml(testResult3));
});

// unordered-list-item
test('2 unordered-list-items with second nested', () => {
  expect(escapeHtml(draftRawToHtml(testJson4))).toBe(escapeHtml(testResult4));
});

test('3 unordered-list-items pyramid', () => {
  expect(escapeHtml(draftRawToHtml(testJson7))).toBe(escapeHtml(testResult7));
});

test('multiple levels and various depth + normal blocks right after', () => {
  expect(escapeHtml(draftRawToHtml(testJson8))).toBe(escapeHtml(testResult8));
});

// ordered-list-item + unordered-list-item
test('mixed use where ordered list nests an unordered item in a pyramid', () => {
  expect(escapeHtml(draftRawToHtml(testJson5))).toBe(escapeHtml(testResult5));
});