const form = document.getElementById("transactionForm");

form.addEventListener("submit", function(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById("name").value;
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;
    const type = document.getElementById("type").value;

    // Create XML string based on form values
    const xmlData = `
      <transactions>
        <transaction>
          <name>${name}</name>
          <amount>${amount}</amount>
          <date>${date}</date>
          <type>${type}</type>
        </transaction>
      </transactions>
    `;
    
    // Perform XSLT transformation with xmlData
    transformXML(xmlData);
});

function transformXML(xmlData) {
    // Load XSLT stylesheet
    const xsltProcessor = new XSLTProcessor();
    const xsltUrl = 'transaction-html.xslt'; // Palitan ito ng tamang URL patungo sa iyong XSLT stylesheet

    fetch(xsltUrl)
      .then(response => response.text())
      .then(xsltText => {
        const xsltDoc = new DOMParser().parseFromString(xsltText, 'text/xml');
        xsltProcessor.importStylesheet(xsltDoc);

        // Transform XML data
        const transformedHtml = xsltProcessor.transformToFragment(new DOMParser().parseFromString(xmlData, 'text/xml'), document);

        // Display transformed HTML output
        const outputElement = document.getElementById('output'); // Palitan ito ng ID ng iyong HTML element kung saan mo gustong ilagay ang output
        outputElement.innerHTML = ''; // Clear the output element
        outputElement.appendChild(transformedHtml);
      })
    .catch(error => console.error('Error loading XSLT:', error));
}

// JavaScript code para i-manage ang transaksyon, charting, at iba pa
const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "PHP",
  signDisplay: "always",
});
const list = document.getElementById("transactionList");
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const ctx = document.getElementById('myChart').getContext('2d');

const transactionsCopy = JSON.parse(localStorage.getItem("transactions")) || [];
const dates = transactionsCopy.map(trx => new Date(trx.date).toLocaleDateString());
const expenses = transactionsCopy.filter(trx => trx.type === "expense").map(trx => trx.amount);
const incomeData = transactionsCopy.filter(trx => trx.type === "income").map(trx => trx.amount);

const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: dates,
        datasets: [{
            label: 'Expenses',
            data: expenses,
            borderColor: 'indianred',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
        }, {
            label: 'Income',
            data: incomeData,
            borderColor: 'yellowgreen',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
        }]
    },
    options: {
        scales: {
            y: {beginAtZero: true}
        }
    }
});

form.addEventListener("submit", addTransaction);

function updateTotal() {
  const incomeTotal = transactions
    .filter((trx) => trx.type === "income")
    .reduce((total, trx) => total + trx.amount, 0);
  const expenseTotal = transactions
    .filter((trx) => trx.type === "expense")
    .reduce((total, trx) => total + trx.amount, 0);
  const balanceTotal = incomeTotal - expenseTotal;
  balance.textContent = formatter.format(balanceTotal).substring(1);
  income.textContent = formatter.format(incomeTotal);
  expense.textContent = formatter.format(expenseTotal * -1);
}

function renderList() {
  list.innerHTML = "";
  status.textContent = "";
  if (transactions.length === 0) {
    status.textContent = "No transactions.";
    return;
  }
  transactions.forEach(({ id, name, amount, date, type }) => {
    const sign = "income" === type ? 1 : -1;
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="name">
        <h4>${name}</h4>
        <p>${new Date(date).toLocaleDateString()}</p>
      </div>
      <div class="amount ${type}">
        <span>${formatter.format(amount * sign)}</span>
      </div>
      <div class="action">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" onclick="deleteTransaction(${id})">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    `;
    list.appendChild(li);
  });
}

renderList();
updateTotal();

function deleteTransaction(id) {
  const index = transactions.findIndex((trx) => trx.id === id);
  transactions.splice(index, 1);
  updateTotal();
  saveTransactions();
  renderList();
}

function addTransaction(e) {
  e.preventDefault();
  const formData = new FormData(this);
  transactions.push({
    id: transactions.length + 1,
    name: formData.get("name"),
    amount: parseFloat(formData.get("amount")),
    date: new Date(formData.get("date")),
    type: "on" === formData.get("type") ? "income" : "expense",
  });
  this.reset();
  updateTotal();
  saveTransactions();
  renderList();
}

function saveTransactions() {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function validateTransaction(formData) {
  const name = formData.get("name");
  const amount = parseFloat(formData.get("amount"));
  const date = formData.get("date");
  const type = formData.get("type");
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  if (validateTransaction(formData)) {
    addTransaction(formData);
  }
});

function executeXPathQuery(xpathExpression) {
  const result = document.evaluate(xpathExpression, document, null, XPathResult.ANY_TYPE, null);
  let node = result.iterateNext();
  while (node) {
    // Process the node here
    console.log(node.textContent);
    node = result.iterateNext();
  }
}

const queryTypeDropdown = document.getElementById("queryTypeDropdown");
queryTypeDropdown.addEventListener("change", function () {
  const selectedQueryType = this.value;
  executeXPathQuery(selectedQueryType);
});

function fetchDataFromExternalService() {
  fetch('https://api.example.com/data')
    .then(response => response.json())
    .then(data => {
      console.log('Data from external service:', data);
    })
    .catch(error => console.error('Error fetching data:', error));
}

const fetchDataButton = document.getElementById("fetchDataButton");
fetchDataButton.addEventListener("click", fetchDataFromExternalService);

function integrateExternalData(externalXml) {
  // Integrate external data with your XML dataset
}

function fetchExternalData() {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        const externalXml = xhr.responseXML;
        integrateExternalData(externalXml);
      } else {
        console.error('Failed to fetch external data:', xhr.status);
      }
    }
  };
  xhr.open('GET', 'external_data.xml', true);
  xhr.send();
}

window.onload = function() {
  fetchExternalData();
};

//Log out
function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = "login.html"; // Redirect to the login page after logout
}

document.addEventListener("DOMContentLoaded", function() {
  displayUserRecords();
});

function displayUserRecords() {
  // Get user records from localStorage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Get the table body element
  const tbody = document.getElementById("userRecords");

  // Clear any existing rows
  tbody.innerHTML = "";

  // Loop through each user record and create a table row
  users.forEach(user => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.password}</td>
      `;
      tbody.appendChild(tr);
  });
}
