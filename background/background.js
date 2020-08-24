/* global chrome, getVariable, LAST_EXPENSE_CLAIM_DATE */

const handleReminderAlarm = async () => {
  const lastExpenseClaim = await getVariable(LAST_EXPENSE_CLAIM_DATE);
  const date = new Date();
  const lastExpenseClaimDate = new Date(lastExpenseClaim);
  // Should be the 14th and the user should not have completed it already
  if (
    date.getDate() === 14 && 
    ((lastExpenseClaim && lastExpenseClaimDate.getMonth() < date.getMonth()) || 
    !lastExpenseClaim)
  ) {
    // sendCommand('XERO_REMINDER');
    chrome.notifications.create('XERO_REMINDER', {
      type:'basic',
      title: 'Xero Claim',
      message: 'Please remember to submit your Xero Claim',
      iconUrl: chrome.runtime.getURL('/images/icon32.png'),
      buttons:[{
        title: 'Open Xero'
      },
      {
        title: 'Do it later'
      }],
    });
  }
};

chrome.alarms.onAlarm.addListener(alarm => {
  console.log('Alarm Triggered', alarm);
  if (alarm.name === 'XERO_REMINDER') {
    handleReminderAlarm();
  }
});

chrome.notifications.onButtonClicked.addListener((notifcationId, buttonClicked) => {
  if (notifcationId === 'XERO_REMINDER' && buttonClicked === 0) {
    chrome.tabs.create({ url: 'https://go.xero.com/Expenses/EditReceipt.aspx' });
  }
});
