const NAME_SURNAME = 'XERO_NAME_SURNAME';
const AMOUNT = 'XERO_AMOUNT';
const PROVIDER = 'XERO_PROVIDER';
const DETAILS_UPDATED = 'XERO_DETAILS_UPDATED';

const generateExcelSpreadsheet = () => {
    return new Promise(resolve => fetch(chrome.runtime.getURL('/files/expenseClaim.ods'))
        .then(res => res.blob()) // Gets the response and returns it as a blob
        .then(blob => {
            blob.fileName = 'expenseClaim.xlsx';
            blob.lastModifiedDate = new Date();
            console.log('xxxxxxxxxxxxx', blob);
            var reader = new FileReader();
            reader.onload = function (e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {
                    type: 'array',
                    cellStyles: true,
                    cellNF: true,
                    cellText: true,
                    cellDates: true,
                    bookDeps: true,
                });
                console.log('xxx workbook', workbook);
                /* DO SOMETHING WITH workbook HERE */
                const amount = localStorage.getItem(AMOUNT);
                const fileName = getFileName();
                const supplier = localStorage.getItem(PROVIDER);
                workbook.Sheets['Expenses Claim']['B3'] = {
                    h: `${fileName}`,
                    r: `<t>${fileName}</t>`,
                    t: "s",
                    v: `${fileName}`,
                    w: `${fileName}`,
                };
                workbook.Sheets['Expenses Claim']['G3'] = {
                    t: "n",
                    v: parseFloat(amount).toFixed(2),
                    w: parseFloat(amount).toFixed(2),
                };

                workbook.Sheets['Expenses Claim']['E3'] = {
                    f: "G3/1.15",
                    t: "n",
                    v: parseFloat(amount / 1.15).toFixed(2),
                    w: parseFloat(amount / 1.15).toFixed(2),
                };
                workbook.Sheets['Expenses Claim']['F3'] = {
                    f: "G3-E3",
                    t: "n",
                    v: parseFloat(parseFloat(workbook.Sheets['Expenses Claim']['G3'].v) - parseFloat(workbook.Sheets['Expenses Claim']['E3'].v)).toFixed(2),
                    w: parseFloat(workbook.Sheets['Expenses Claim']['G3'].v - workbook.Sheets['Expenses Claim']['E3'].v).toFixed(2),
                };
                workbook.Sheets['Expenses Claim']['C3'] = {
                    t: "s",
                    v: supplier,
                    w: supplier,
                };
                // console.log(typeof workbook.Sheets['Expenses Claim']['A3'].v)
                const now = new Date();
                const year = now.getFullYear();
                const month = `0${now.getMonth() + 1}`.slice(-2);
                const date = new Date(`${year}-${month}-01T02:00:00.701Z`);
                workbook.Sheets['Expenses Claim']['A3'] = {
                    t: "d",
                    v: date,
                    w: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
                    z: "m/d/yy",
                };
                XLSX.writeFile(workbook, `${fileName}.xlsx`);
                resolve(true);
            };
            reader.readAsArrayBuffer(blob);
        }));
}

const providerMap = {
    rain: 'rain',
    cellc: 'CellC',
    vodacom: 'Vodacom',
    mtn: 'MTN',
    telkom: 'Telkom Mobile',
};

const openClearModal = () => {
    Swal.fire({
        title: 'Are you sure?',
        text: 'Are you sure you want to clear all your saved data? You will have to fill in your information again',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, clear it!'
    }).then((result) => {
        if (result.value) {
            localStorage.removeItem(NAME_SURNAME);
            localStorage.removeItem(AMOUNT);
            localStorage.removeItem(PROVIDER);
            localStorage.removeItem(DETAILS_UPDATED);
            Swal.fire(
                'Cleared!',
                'Your data has been cleared',
                'success'
            );
        }
    })
};

const openEditDetailsModal = () => {
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
        inputValue: localStorage.getItem(NAME_SURNAME) || '',
        inputPlaceholder: 'John Doe',
        inputValidator: (value) => {
            if (!value) {
                return 'Please fill in name & surname!'
            }
        },
    },
    {
        text: 'Select your cellphone provider',
        input: 'select',
        inputPlaceholder: 'Select provider...',
        inputValue: localStorage.getItem(PROVIDER) || '',
        inputOptions: {
            'mtn': 'MTN',
            'cellc': 'CellC',
            'vodacom': 'Vodacom',
            'rain': 'Rain',
            'telkom': 'Telkom Mobile',
        },
        inputValidator: (value) => {
            if (!value) {
                return 'Please select a provider!'
            }
        },
    },
    ]).then(({ value: results }) => {
        if (results) {
            console.log(results);
            localStorage.setItem(NAME_SURNAME, results[0]);
            localStorage.setItem(PROVIDER, results[1]);
            localStorage.setItem(DETAILS_UPDATED, (new Date()).toString());
            Swal.fire(
                'Details Updated!',
                'Your details have been updated!',
                'success'
            );
        }
    });
};

const openAutofillModal = () => {
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
                return 'You need to upload an invoice!'
            }
        }
    },
    {
        title: 'Claim Amount',
        text: 'Enter the amount you want to claim',
        input: 'number',
        inputValue: localStorage.getItem(AMOUNT) || '500',
        confirmButtonText: 'Finish &#10003;',
        inputValidator: (value) => {
            if (!value) {
                return 'You need to enter a valid amount!'
            }
        }
    }
    ]).then(({ value: results }) => {
        localStorage.setItem(AMOUNT, results[1]);
        const fileName = getFileName();
        autofillReceiptForm();
        Swal.fire({
            title: 'Generating Files',
            html: 'Filling in your forms and generating your files, please wait ...',
            onBeforeOpen: () => {
                Swal.showLoading()
            }
        });
        downloadFile(results[0], fileName);
        generateExcelSpreadsheet().then(() => {
            Swal.close();
            Swal.fire(
                'Done!',
                'Your form has been autofilled in! Also check your downloads for the files needed to submit!',
                'success'
            );
        });
    });
};

chrome.runtime.onMessage.addListener(function (data) {
    if (data.type === 'XERO_EDIT') {
        openEditDetailsModal();
    }
    if (data.type === 'XERO_AUTOFILL') {
        openAutofillModal();
    }
    if (data.type === 'XERO_CLEAR') {
        openClearModal();
    }
});

const downloadFile = (file, filename) => {
    const reader = new FileReader()
    reader.onload = (e) => {
        console.log(e.target.result);
        const a = document.createElement('a');
        a.href = e.target.result;
        a.target = '_blank';
        a.download = `${filename}.${file.type.split('/')[1]}`;
        a.click();
    }
    reader.readAsDataURL(file);
};

const getCurrentYear = () => {
    return new Date().getFullYear();
}

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
    }
    return getMonthName[new Date().getMonth()]
}

const getFileName = () => {
    const currentYear = getCurrentYear();
    const currentMonth = getCurrentMonth();
    const provider_ = providerMap[localStorage.getItem(PROVIDER)];
    const provider = provider_[0].toUpperCase() + provider_.slice(1);
    return `OV01 - ${provider} - ${localStorage.getItem(NAME_SURNAME).split(' ')[0][0]}${localStorage.getItem(NAME_SURNAME).split(' ')[1][0]} - ${currentMonth} ${currentYear}`;
}

const autofillReceiptForm = () => {
    d = document;
    // form ID's
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
    const fileName = getFileName();

    // Values to be filled in
    receiptFrom.value = providerMap[localStorage.getItem(PROVIDER)]; // Receipt from
    date.click(); // Date
    document.getElementsByClassName('x-date-active')[0].children[0].click(); // Select the first date;
    reference.value = fileName;
    topTotal.value = localStorage.getItem(AMOUNT); // Total
    description.value = fileName;
    account.value = '405 - Cell phone'; // Account
    unitPrice.value = localStorage.getItem(AMOUNT); // Unit Price
    taxRate.value = 'Tax Exempt (0%)'; // Tax Rate
    amountZar.value = localStorage.getItem(AMOUNT); // Amount ZAR
    bottomTotal.value = localStorage.getItem(AMOUNT); // Total
}
