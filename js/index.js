
document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "http://localhost:3000";
  const customerTable = document.getElementById("customerTable").getElementsByTagName("tbody")[0];
  const filterNameInput = document.getElementById("filterName");
  const filterAmountInput = document.getElementById("filterAmount");
  const chartContainer = document.getElementById("chartContainer");
  const transactionChart = document.getElementById("transactionChart").getContext('2d');
  const customerTablechildren = document.getElementsByTagName("tbody tr")

  let chart;
  let customers = [];
  let transactions = [];
  let filteredtransactions = [];


  const fetchcustomersAndtransactions = async () => {
    const [customersResponse, transactionsResponse] = await Promise.all([
      fetch(`${apiUrl}/customers`),
      fetch(`${apiUrl}/transactions`)
    ]);
    customers = await customersResponse.json();
    transactions = await transactionsResponse.json();
    filteredtransactions = transactions;
    renderTable();
  };

  const renderTable = () => {
    customerTable.innerHTML = "";
    filteredtransactions.forEach(transaction => {
      const customer = customers.find(c => c.id == transaction.customer_id);
      const row = customerTable.insertRow();
      row.insertCell(0).innerText = customer ? customer.name : ".";
      row.insertCell(1).innerText = transaction ? transaction.amount : ".";
      row.insertCell(2).innerHTML = `<button class="btn btn-primary w-25" onclick="showChart(${transaction.customer_id})">View</button>`
    });

  };

  const filtertransactions = () => {
    let matchAmount;
    let matchName;
    let nameFilter = filterNameInput.value.toLowerCase();
    let amountFilter = parseFloat(filterAmountInput.value);
    filteredtransactions = transactions.filter(transaction => {
      const customer = customers.find(c => c.id === transaction.customer_id);

      if (nameFilter == "") {
        nameFilter = " "
      }
      else {
        matchName = customer && customer.name.toLowerCase().includes(nameFilter);
      }

      if (isNaN(amountFilter)) {
        amountFilter = 0
      }
      else {
        matchAmount = transaction && transaction.amount >= amountFilter;
      }

      return matchName && matchAmount;
    });
    renderTable();

  };

  window.showChart = (customerId) => {
    console.log(customerId);
    const customerTransactions = transactions.filter(transaction => transaction.customer_id === customerId);
    const labels = customerTransactions.map((_, index) => index + 1);
    const data = customerTransactions.map(transaction => transaction.amount);

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(transactionChart, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Transactions',
          data: data,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: false
        }]
      },
      options: {
        scales: {
          x: {
            beginAtZero: true
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });

    chartContainer.style.display = 'block';
    window.scrollTo(0, chartContainer.offsetTop);
  };

  filterNameInput.addEventListener("keyup", filtertransactions);
  filterAmountInput.addEventListener("keyup", filtertransactions);

  fetchcustomersAndtransactions();
});
