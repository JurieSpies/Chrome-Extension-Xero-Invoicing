/* global Swal, removeVariable, getVariable, setVariable NAME_SURNAME, AMOUNT, PROVIDER, PROVIDER_OTHER, DETAILS_UPDATED, chrome */

const openClearModal = () => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Are you sure you want to clear all your saved data? You will have to fill in your information again',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, clear it!'
  }).then(async (result) => {
    if (result.value) {
      Swal.fire({
        title: 'Syncing Details',
        html: 'Please wait while your details are being synced ...',
        onBeforeOpen: () => {
          Swal.showLoading();
        }
      });
      await removeVariable(NAME_SURNAME);
      await removeVariable(AMOUNT);
      await removeVariable(PROVIDER);
      await removeVariable(PROVIDER_OTHER);
      await removeVariable(DETAILS_UPDATED);
      Swal.close();
      Swal.fire(
        'Cleared!',
        'Your data has been cleared',
        'success'
      );
    }
  });
};

const openOtherProviderModal = async () => {
  const otherProvider = await getVariable(PROVIDER_OTHER);
  return new Promise(resolve => {
    Swal.fire({
      title: 'Edit Details',
      confirmButtonText: 'Next &rarr;',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      text: 'Enter the name of your provider (Please ensure this provider is on the contacts of Xero, otherwise you need to add the provider to the contacts)',
      input: 'text',
      inputValue: otherProvider,
      inputPlaceholder: 'Afrihost',
      inputValidator: (value) => {
        if (!value) {
          return 'Please fill in provider name!';
        }
      },
    }).then(async ({ value: result }) => {
      console.log(result);
      if (result) {
        await setVariable(PROVIDER_OTHER, result);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

const openEditDetailsModal = async () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async resolve => {
    const nameSurname = await getVariable(NAME_SURNAME);
    const provider = await getVariable(PROVIDER);
    console.log('Variables', nameSurname, provider);
    Swal.mixin({
      title: 'Edit Details',
      confirmButtonText: 'Next &rarr;',
      showCancelButton: true,
      progressSteps: ['1', '2'],
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).queue([{
      text: 'Enter your name & surname',
      input: 'text',
      inputValue: nameSurname,
      inputPlaceholder: 'John Doe',
      inputValidator: (value) => {
        if (!value) {
          return 'Please fill in name & surname!';
        }
      },
    },
    {
      text: 'Select your cellphone provider',
      input: 'select',
      inputPlaceholder: 'Select provider...',
      inputValue: provider,
      inputOptions: {
        'mtn': 'MTN',
        'cellc': 'CellC',
        'vodacom': 'Vodacom',
        'rain': 'Rain',
        'telkom': 'Telkom Mobile',
        'fnb': 'FNB',
        'afrihost': 'Afrihost',
        'other': 'Other (Not on list)'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Please select a provider!';
        }
      },
    },
    ]).then(async ({ value: results }) => {
      if (results) {
        const syncData = async () => {
          Swal.fire({
            title: 'Syncing Details',
            html: 'Please wait while your details are being synced ...',
            onBeforeOpen: () => {
              Swal.showLoading();
            }
          });
          await setVariable(NAME_SURNAME, results[0]);
          await setVariable(PROVIDER, results[1]);
          await setVariable(DETAILS_UPDATED, (new Date()).toString());
          Swal.close();
          Swal.fire(
            'Details Updated!',
            'Your details have been updated!',
            'success'
          ).then(() => resolve(true));
        };
        if (results[1] === 'other') {
          openOtherProviderModal().then(res => {
            if (res) {
              syncData();
            } else {
              resolve(false);
            }
          });
        } else {
          syncData();
        }
      } else {
        resolve(false);
      }
    });
  });
};

const openAboutModal = () => {
  const manifestData = chrome.runtime.getManifest();
  Swal.fire({
    title: 'About',
    html: `
      <span style="position: relative; line-height: 40px; font-weight: bold; font-size: 20px;">
        Developed with <span style="font-size: 40px; color: red; position: absolute;">&#10084;</span> <span style="margin-left: 40px;">by</span></span><br />
      <span style="font-size: 14px;">Jurie Spies <a href="mailto:juriespies@gmail.com">(juriespies@gmail.com)</a></span><br />
      <span style="font-size: 14px;">Wilco Breedt <a href="mailto:wilcobreedt@gmail.com">(wilcobreedt@gmail.com)</a></span><br />
      <span style="font-size: 12px;">version ${manifestData.version}</span>
    `,
    confirmButtonText: 'OK',
    confirmButtonColor: '#3085d6',
  });
};

const openReminderModal = () => {
  Swal.fire({
    title: 'Open Vantage Expense Claim',
    confirmButtonText: 'Yes, Please! &#10003;',
    cancelButtonText: 'No, Later &#10007;',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    text: 'Just a reminder to submit your expense claim! Would you like to submit it now?',
  }).then(async ({ value: result }) => {
    if (result) {
      window.open('https://go.xero.com/Expenses/EditReceipt.aspx', '_blank');
    }
  });
};

chrome.runtime.onMessage.addListener(data => {
  if (data.type === 'XERO_EDIT') {
    openEditDetailsModal();
  }
  if (data.type === 'XERO_CLEAR') {
    openClearModal();
  }
  if (data.type === 'XERO_ABOUT') {
    openAboutModal();
  }
  if  (data.type === 'XERO_REMINDER') {
    openReminderModal();
  }
});
