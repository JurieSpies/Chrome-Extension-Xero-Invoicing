/* global chrome, getVariable, LAST_EXPENSE_CLAIM_DATE */
const sendCommand = (command) => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: command });
    }
  });
};

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
    sendCommand('XERO_REMINDER');
  }
};

chrome.alarms.onAlarm.addListener(alarm => {
  console.log('Alarm Triggered', alarm);
  if (alarm.name === 'XERO_REMINDER') {
    handleReminderAlarm();
  }
});
