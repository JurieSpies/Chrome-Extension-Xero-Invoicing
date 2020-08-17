/* global Swal, removeVariable, getVariable, setVariable NAME_SURNAME, AMOUNT, PROVIDER, DETAILS_UPDATED, chrome */

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

const openEditDetailsModal = async () => {
  const nameSurname = await getVariable(NAME_SURNAME) || '';
  const provider = await getVariable(PROVIDER) || '';
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
    },
    inputValidator: (value) => {
      if (!value) {
        return 'Please select a provider!';
      }
    },
  },
  ]).then(async ({ value: results }) => {
    if (results) {
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
      );
    }
  });
};

chrome.runtime.onMessage.addListener(function (data) {
  if (data.type === 'XERO_EDIT') {
    openEditDetailsModal();
  }
  if (data.type === 'XERO_CLEAR') {
    openClearModal();
  }
});
