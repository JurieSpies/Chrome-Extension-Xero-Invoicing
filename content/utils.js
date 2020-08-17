
/* eslint-disable no-unused-vars */
/* global chrome */

const NAME_SURNAME = 'XERO_NAME_SURNAME';
const AMOUNT = 'XERO_AMOUNT';
const PROVIDER = 'XERO_PROVIDER';
const DETAILS_UPDATED = 'XERO_DETAILS_UPDATED';

const getVariable = async (key) => {
  return new Promise(resolve => {
    chrome.storage.sync.get(key, (result) => {
      resolve(result[key]);
    });
  });
};

const removeVariable = async (key) => {
  return setVariable(key, null);
};

const setVariable = async (key, value) => {
  return new Promise(resolve => {
    chrome.storage.sync.set({[key]: value}, () => {
      resolve(value);
    });
  });
};
