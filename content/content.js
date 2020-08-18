/* global 
  Swal,
  removeVariable,
  getVariable,
  setVariable,
  NAME_SURNAME,
  POSITION,
  AMOUNT,
  PROVIDER,
  PROVIDER_OTHER,
  LAST_EXPENSE_CLAIM_DATE,
  DETAILS_UPDATED,
  chrome
*/

const openClearModal = () => {
    Swal.fire({
        title: 'Are you sure?',
        text: 'Are you sure you want to clear all your saved data? You will have to fill in your information again',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, clear it!'
    }).then(async(result) => {
        if (result.value) {
            Swal.fire({
                title: 'Syncing Details',
                html: 'Please wait while your details are being synced ...',
                onBeforeOpen: () => {
                    Swal.showLoading();
                }
            });
            await removeVariable(NAME_SURNAME);
            await removeVariable(POSITION);
            await removeVariable(AMOUNT);
            await removeVariable(PROVIDER);
            await removeVariable(PROVIDER_OTHER);
            await removeVariable(DETAILS_UPDATED);
            await removeVariable(LAST_EXPENSE_CLAIM_DATE);
            Swal.close();
            Swal.fire(
                'Cleared!',
                'Your data has been cleared',
                'success'
            );
        }
    });
};

const openOtherProviderModal = async() => {
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
        }).then(async({ value: result }) => {
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

const openEditDetailsModal = async() => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async resolve => {
        const nameSurname = await getVariable(NAME_SURNAME);
        const position = await getVariable(POSITION);
        const provider = await getVariable(PROVIDER);

        // console.log('Variables', nameSurname, provider);

        Swal.mixin({
            title: 'Edit Details',
            confirmButtonText: 'Next &rarr;',
            showCancelButton: true,
            progressSteps: ['1', '2', '3'],
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
                text: 'What is your Position',
                input: 'text',
                inputPlaceholder: 'Software Developer...',
                inputValue: position,
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
        ]).then(async({ value: results }) => {
            if (results) {
                const syncData = async() => {
                    Swal.fire({
                        title: 'Syncing Details',
                        html: 'Please wait while your details are being synced ...',
                        onBeforeOpen: () => {
                            Swal.showLoading();
                        }
                    });
                    await setVariable(NAME_SURNAME, results[0]);
                    await setVariable(POSITION, results[1]);
                    await setVariable(PROVIDER, results[2]);
                    await setVariable(DETAILS_UPDATED, (new Date()).toString());
                    Swal.close();
                    Swal.fire(
                        'Details Updated!',
                        'Your details have been updated!',
                        'success'
                    ).then(() => resolve(true));
                };
                if (results[2] === 'other') {
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
    }).then(async({ value: result }) => {
        if (result) {
            window.open('https://go.xero.com/Expenses/EditReceipt.aspx', '_blank');
        }
    });
};

const generateLeaveApplication = () => {
    function loadFile(url, callback) {
        PizZipUtils.getBinaryContent(url, callback);
    }
    generate()

    function generate() {
        loadFile(chrome.runtime.getURL('/files/LeaveRequestForm.docx'), async function(error, content) {
            if (error) { throw error };

            // The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
            function replaceErrors(key, value) {
                if (value instanceof Error) {
                    return Object.getOwnPropertyNames(value).reduce(function(error, key) {
                        error[key] = value[key];
                        return error;
                    }, {});
                }
                return value;
            }

            function errorHandler(error) {
                console.log(JSON.stringify({ error: error }, replaceErrors));

                if (error.properties && error.properties.errors instanceof Array) {
                    const errorMessages = error.properties.errors.map(function(error) {
                        return error.properties.explanation;
                    }).join("\n");
                    console.log('errorMessages', errorMessages);
                    // errorMessages is a humanly readable message looking like this :
                    // 'The tag beginning with "foobar" is unopened'
                }
                throw error;
            }

            var zip = new PizZip(content);
            var doc;
            try {
                doc = new window.docxtemplater(zip);
            } catch (error) {
                // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
                errorHandler(error);
            }

            const firstName = await getVariable(NAME_SURNAME)
            const position = await getVariable(POSITION)

            doc.setData({
                first_name: firstName || 'Go to "Edit Personal details" and insert your Name',
                position: position || 'Go to "Edit Personal details" and insert your Position'
            });
            try {
                // render the document (replace all occurrences of {first_name} by John, {last_name} by Doe, ...)
                doc.render();
            } catch (error) {
                // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
                errorHandler(error);
            }

            var out = doc.getZip().generate({
                    type: "blob",
                    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                }) //Output the document using Data-URI
            saveAs(out, `${firstName} - Leave Request Form.docx`)
        })
    }
}

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
    if (data.type === 'XERO_REMINDER') {
        openReminderModal();
    }
    if (data.type === 'XERO_REMINDER') {
        openReminderModal();
    }
    if (data.type === 'LEAVE_FORM') {
        generateLeaveApplication();
    }
});