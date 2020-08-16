// Prompts User otherwise recall from Local storage

// Clear Local Storage
localStorage.clear()
const nameStart = localStorage.getItem('nameStart') || prompt("What is your name ?").charAt(0).toUpperCase()
const surnameStart = localStorage.getItem('surnameStart') || prompt("What is your surname ?").charAt(0).toUpperCase()

//Saved on Local storage
localStorage.setItem('nameStart', nameStart)
localStorage.setItem('surnameStart', surnameStart)
d = document;
const currentYear = new Date().getFullYear()
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
const currentMonth = getMonthName[new Date().getMonth()]
    // form ID's
const receiptFrom = d.getElementsByClassName("x-form-text x-form-field autocompleter x-form-focus")[0]
const date = d.getElementsByClassName("x-form-trigger x-form-date-trigger")[0]
const reference = d.getElementsByClassName("field")[4]
const topTotal = d.getElementsByClassName("field")[6]
const description = d.getElementsByClassName("field xoDescription")[0]
const unitPrice = d.getElementsByClassName("field")[11]
const account = d.getElementsByClassName("dd")[1].children[0]
const taxRate = d.getElementsByClassName("tax")[2]
const amountZar = d.getElementsByClassName("field totalLineItem")[0]
const bottomTotal = d.getElementById("invoiceTotal")
    //Values to be filled in
receiptFrom.value = "rain" //Receipt from
date.click() //Date
reference.value = `OV01 - Rain - ${localStorage.getItem('nameStart')}${localStorage.getItem('surnameStart')} - ${currentMonth} ${currentYear}` //ref
topTotal.value = '500.00' //Total
description.value = `OV01 - Rain - ${localStorage.getItem('nameStart')}${localStorage.getItem('surnameStart')} - ${currentMonth} ${currentYear}` //Description
account.value = "405 - Cell phone" //Account
unitPrice.value = "500.00" //Unit Price
taxRate.value = "Tax Exempt (0%)" //Tax Rate
amountZar.value = "500.00" //Amount ZAR
bottomTotal.value = "500.00" //Total