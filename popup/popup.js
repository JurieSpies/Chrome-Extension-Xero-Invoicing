/* global chrome */

document.addEventListener('DOMContentLoaded', () => {
  const xeroButton = document.getElementById('xero-btn');
  const editButton = document.getElementById('edit-btn');
  const receiptButton = document.getElementById('receipt-btn');
  const leaveButton = document.getElementById('leave-app-form-btn');
  const clearButton = document.getElementById('clear-btn');
  const openVantageLogo = document.getElementById('ov-logo');
  const aboutButton = document.getElementById('about-btn');
  const notificationButton = document.getElementById('notification-btn');
  const alarmName = 'XERO_REMINDER';
  let alarmActive = false;

  chrome.alarms.get(alarmName, alarm => {
    console.log(alarm);
    if (alarm) {
      alarmActive = true;
      notificationButton.innerText = 'Disable Expense Claim Notification';
    } else {
      alarmActive = false;
      notificationButton.innerText = 'Enable Expense Claim Notification';
    }
  });

  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    if (tabs[0].url !== 'https://go.xero.com/Expenses/EditReceipt.aspx') {
      receiptButton.setAttribute('disabled', true);
      receiptButton.setAttribute('title', 'Can only use autofill on Xero Receipt page');
    }
  });

  const sendCommand = (command) => {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: command });
      }
    });
  };

  openVantageLogo.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.openvantage.co/' });
  });

  notificationButton.addEventListener('click', () => {
    if (alarmActive) {
      chrome.alarms.clearAll();
      alarmActive = false;
      notificationButton.innerText = 'Enable Expense Claim Notification';
    } else {
      chrome.alarms.create(alarmName, { periodInMinutes: 60 });
      alarmActive = true;
      notificationButton.innerText = 'Disable Expense Claim Notification';
    }
  });

  xeroButton.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://go.xero.com/Expenses/EditReceipt.aspx' });
  });

  receiptButton.addEventListener('click', () => {
    sendCommand('XERO_AUTOFILL');
  });

  leaveButton.addEventListener('click', () => {
    chrome.notifications.create({
      type:'basic',
      title: 'Xero Claim',
      message: 'Please remember to submit your Xero Claim',
      iconUrl: chrome.runtime.getURL('/images/icon32.png'),
    }, notifcation => console.log('xxxxxxxxxxxxxx', notifcation));
    // sendCommand('LEAVE_FORM');
  });

  clearButton.addEventListener('click', () => {
    sendCommand('XERO_CLEAR');
  });

  editButton.addEventListener('click', () => {
    sendCommand('XERO_EDIT');
  });

  aboutButton.addEventListener('click', () => {
    sendCommand('XERO_ABOUT');
  });
});