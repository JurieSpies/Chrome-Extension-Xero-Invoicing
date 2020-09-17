/* global 
  Swal, 
  XLSX, 
  chrome, 
  getVariable, 
  setVariable,
  openEditDetailsModal,
  NAME_SURNAME,
  AMOUNT,
  PROVIDER,
  PROVIDER_OTHER,
  DETAILS_UPDATED,
  LAST_EXPENSE_CLAIM_DATE,
*/

const generateExcelSpreadsheet = () => {
  return new Promise(resolve => fetch(chrome.runtime.getURL('/files/expenseClaim.xlsx'))
    .then(res => res.blob()) // Gets the response and returns it as a blob
    .then(blob => {
      blob.fileName = 'expenseClaim.xlsx';
      blob.lastModifiedDate = new Date();
      var reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {
          type: 'array',
          cellStyles: true,
          cellNF: true,
          cellText: true,
          cellDates: true,
          bookDeps: true,
        });
        const amount = await getVariable(AMOUNT);
        const fileName = await getInvoiceFileName();
        const supplier = await getProvider();
        workbook.Sheets['Expenses Claim']['B3'] = {
          h: `${fileName}`,
          r: `<t>${fileName}</t>`,
          t: 's',
          v: `${fileName}`,
          w: `${fileName}`,
        };
        workbook.Sheets['Expenses Claim']['G3'] = {
          t: 'n',
          v: parseFloat(amount).toFixed(2),
          w: parseFloat(amount).toFixed(2),
        };

        workbook.Sheets['Expenses Claim']['E3'] = {
          f: 'G3/1.15',
          t: 'n',
          v: parseFloat(amount / 1.15).toFixed(2),
          w: parseFloat(amount / 1.15).toFixed(2),
        };
        workbook.Sheets['Expenses Claim']['F3'] = {
          f: 'G3-E3',
          t: 'n',
          v: parseFloat(parseFloat(workbook.Sheets['Expenses Claim']['G3'].v) - parseFloat(workbook.Sheets['Expenses Claim']['E3'].v)).toFixed(2),
          w: parseFloat(workbook.Sheets['Expenses Claim']['G3'].v - workbook.Sheets['Expenses Claim']['E3'].v).toFixed(2),
        };
        workbook.Sheets['Expenses Claim']['C3'] = {
          t: 's',
          v: supplier,
          w: supplier,
        };
        // console.log(typeof workbook.Sheets['Expenses Claim']['A3'].v)
        const now = new Date();
        const year = now.getFullYear();
        const month = `0${now.getMonth() + 1}`.slice(-2);
        const date = new Date(`${year}-${month}-01T02:00:00.701Z`);
        workbook.Sheets['Expenses Claim']['A3'] = {
          t: 'd',
          v: date,
          w: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
          z: 'm/d/yy',
        };
        const workbookFileName = await getExcelFileName();
        XLSX.writeFile(workbook, `${workbookFileName}.xlsx`);
        resolve(true);
      };
      reader.readAsArrayBuffer(blob);
    }));
};

const providerMap = {
  rain: 'rain',
  cellc: 'CellC',
  vodacom: 'Vodacom',
  mtn: 'MTN',
  telkom: 'Telkom Mobile',
  fnb: 'FNB',
};

const openAutofillModal = async () => {
  const amount = await getVariable(AMOUNT);
  Swal.mixin({
    confirmButtonText: 'Next &rarr;',
    showCancelButton: true,
    progressSteps: ['1', '2'],
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
  }).queue([{
    title: 'Invoice',
    text: 'Upload an invoice that you wish to claim for',
    input: 'file',
    inputValidator: (value) => {
      if (!value) {
        return 'You need to upload an invoice!';
      }
    }
  },
  {
    title: 'Claim Amount',
    text: 'Enter the amount you want to claim',
    input: 'number',
    inputValue: amount || '500',
    confirmButtonText: 'Finish &#10003;',
    inputValidator: (value) => {
      if (!value) {
        return 'You need to enter a valid amount!';
      }
    }
  }
  ]).then(async ({ value: results }) => {
    if (results) {
      const fileName = await getInvoiceFileName();
      Swal.fire({
        title: 'Generating Files',
        html: 'Filling in your forms and generating your files, please wait ...',
        onBeforeOpen: () => {
          Swal.showLoading();
        }
      });
      await setVariable(AMOUNT, results[1]);
      await setVariable(LAST_EXPENSE_CLAIM_DATE, (new Date()).toDateString());
      await autofillReceiptForm();
      await downloadFile(results[0], fileName);
      await generateExcelSpreadsheet();
      Swal.close();
      Swal.fire(
        'Done!',
        'Your form has been autofilled in! Also check your downloads for the files needed to submit!',
        'success'
      );
    }
  });
};

const downloadFile = (file, filename) => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log(e.target.result);
      const a = document.createElement('a');
      a.href = e.target.result;
      a.target = '_blank';
      a.download = `${filename}.${file.type.split('/')[1]}`;
      a.click();
      resolve(true);
    };
    reader.readAsDataURL(file);
  });
};

const getCurrentYear = () => {
  return new Date().getFullYear();
};

const getCurrentMonth = () => {
  const getMonthName = {
    '0': 'January',
    '1': 'February',
    '2': 'March',
    '3': 'April',
    '4': 'May',
    '5': 'June',
    '6': 'July',
    '7': 'August',
    '8': 'September',
    '9': 'October',
    '10': 'November',
    '11': 'December',
  };
  return getMonthName[new Date().getMonth()];
};

const getExcelFileName = async () => {
  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth();
  const nameSurname = await getVariable(NAME_SURNAME);
  return `Expense_claim_${nameSurname.split(' ')[0][0].toUpperCase()}${nameSurname.split(' ')[1][0].toUpperCase()}_${currentMonth}_${currentYear}`;
};

const getInvoiceFileName = async () => {
  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth();
  const nameSurname = await getVariable(NAME_SURNAME);
  const provider_ = await getProvider();
  const provider = provider_[0].toUpperCase() + provider_.slice(1);
  return `OV01 - ${provider} - ${nameSurname.split(' ')[0][0].toUpperCase()}${nameSurname.split(' ')[1][0].toUpperCase()} - ${currentMonth} ${currentYear}`;
};

const getProvider = async () => {
  const provider = await getVariable(PROVIDER);
  return provider === 'other' ? await getVariable(PROVIDER_OTHER) : providerMap[provider];
};

const autofillReceiptForm = async () => {
  const d = document;
  const receiptFrom = d.getElementsByClassName('x-form-text x-form-field autocompleter x-form-focus')[0];
  const date = d.getElementsByClassName('x-form-trigger x-form-date-trigger')[0];
  const reference = d.getElementsByClassName('field')[4];
  const topTotal = d.getElementsByClassName('field')[6];
  const description = d.getElementsByClassName('field xoDescription')[0];
  const unitPrice = d.getElementsByClassName('field')[11];
  const account = d.getElementsByClassName('dd')[1].children[0];
  const taxRate = d.getElementsByClassName('tax')[2];
  const amountZar = d.getElementsByClassName('field totalLineItem')[0];
  const bottomTotal = d.getElementById('invoiceTotal');
  const fileName = await getInvoiceFileName();
  const amount = await getVariable(AMOUNT);
  const provider = await getProvider();
  // Values to be filled in
  receiptFrom.value = provider; // Receipt from
  date.click(); // Date
  document.getElementsByClassName('x-date-active')[0].children[0].click(); // Select the first date;
  reference.value = fileName;
  topTotal.value = amount; // Total
  description.value = fileName;
  account.value = '405 - Cell phone'; // Account
  unitPrice.value = amount; // Unit Price
  taxRate.value = 'Tax Exempt (0%)'; // Tax Rate
  amountZar.value = amount; // Amount ZAR
  bottomTotal.value = amount; // Total
};

const handleAutoFill = async () => {
  const detailsComplete = await checkDetailsCompleted();
  if (!detailsComplete) {
    openEditDetailsModal().then(() => openAutofillModal());
  } else {
    openAutofillModal();
  }
};

chrome.runtime.onMessage.addListener(data => {
  if (data.type === 'XERO_AUTOFILL') {
    handleAutoFill();
  }
});

const checkDetailsCompleted = async () => {
  return new Promise(resolve => {
    const detailsRequired = [NAME_SURNAME, PROVIDER, DETAILS_UPDATED];
    const promises = detailsRequired.map(getVariable);
    Promise.all(promises).then(values => {
      resolve(values.every(val => val));
    });
  });
};

const openWelcomeModal = () => {
  Swal.fire({
    title: 'Hi there!',
    html: `
      <span>We see that this is the first time the extention has been active on this page, would you like to complete your personal details?</span>
      <br />
      <span style="font-size: 12px;">Please be aware that you cannot autofill receipts until you have completed your personal details</span>
    `,
    confirmButtonText: 'Yes, Let\'s go! &#10003;',
    cancelButtonText: 'No, Later &#10007;',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
  }).then(({value}) => {
    if (value) {
      openEditDetailsModal().then(res => {
        if (res) {
          openPromptAutoFillModal();
        }
      });
    }
  });
};

const openPromptAutoFillModal = () => {
  Swal.fire({
    title: 'Autofill Receipt',
    text: 'Would you like to autofill your receipt? You can always click the autofill button on the extention if you cancel :)',
    confirmButtonText: 'Yes, Autofill &#10003;',
    cancelButtonText: 'No, &#10007;',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
  }).then(({value}) => {
    if (value) {
      openAutofillModal();
    }
  });
};

const onPageFirstLoad = async () => {
  const detailsComplete = await checkDetailsCompleted();
  if (!detailsComplete) {
    openWelcomeModal();
  } else {
    openPromptAutoFillModal();
  }
};

onPageFirstLoad();
