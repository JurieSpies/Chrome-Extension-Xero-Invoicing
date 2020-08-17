/* global chrome */

document.addEventListener('DOMContentLoaded', () => {
  const xeroButton = document.getElementById('xero-btn');
  const editButton = document.getElementById('edit-btn');
  const receiptButton = document.getElementById('receipt-btn');
  const clearButton = document.getElementById('clear-btn');
  const openVantageLogo = document.getElementById('ov-logo');
  const aboutButton = document.getElementById('about-btn');

  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    if (tabs[0].url !== 'https://go.xero.com/Expenses/EditReceipt.aspx') {
      receiptButton.setAttribute('disabled', true);
      receiptButton.setAttribute('title', 'Can only use autofill on Xero Receipt page');
    }
  });

  const sendCommand = (command) => {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      console.log(tabs[0]);
      chrome.tabs.sendMessage(tabs[0].id, { type: command });
    });
  };

  openVantageLogo.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.openvantage.co/' });
  });

  xeroButton.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://go.xero.com/Expenses/EditReceipt.aspx' });
  });

  receiptButton.addEventListener('click', () =>  {
    sendCommand('XERO_AUTOFILL');
  });

  clearButton.addEventListener('click', () =>  {
    sendCommand('XERO_CLEAR');
  });

  editButton.addEventListener('click', () => {
    sendCommand('XERO_EDIT');
  });

  aboutButton.addEventListener('click', () => {
    sendCommand('XERO_ABOUT');
  });
});
