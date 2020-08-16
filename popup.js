
document.addEventListener('DOMContentLoaded', function () {
  const xeroButton = document.getElementById('xero-btn');
  const editButton = document.getElementById('edit-btn');
  const receiptButton = document.getElementById('receipt-btn');
  const clearButton = document.getElementById('clear-btn');

  const sendCommand = (command) => {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      console.log(tabs[0]);
      chrome.tabs.sendMessage(tabs[0].id, { type: command });
    });
  }

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
});
