
/* eslint-disable no-unused-vars */
/* global chrome */

const NAME_SURNAME = 'XERO_NAME_SURNAME';
const AMOUNT = 'XERO_AMOUNT';
const PROVIDER = 'XERO_PROVIDER';
const PROVIDER_OTHER = 'XERO_PROVIDER_OTHER';
const DETAILS_UPDATED = 'XERO_DETAILS_UPDATED';
const LAST_EXPENSE_CLAIM_DATE = 'XERO_LAST_EXPENSE_CLAIM_DATE';

const getVariable = async (key) => {
  return new Promise(resolve => {
    chrome.storage.sync.get(key, (result) => {
      resolve(result[key] || '');
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
