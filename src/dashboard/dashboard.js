
/* eslint-disable react/no-unknown-property */
import React, { useState, useEffect } from 'react';
import { reactLocalStorage } from 'reactjs-localstorage';
import { Pie, Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import 'chartjs-plugin-datalabels';

const BACKEND_URL = "http://164.92.96.20:3031";

function Dashboard() {
  const [budgetData, setBudgetData] = useState([]);
  const [income, setIncome] = useState(0);
  const [savings, setSavings] = useState(0);
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [color, setColor] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = reactLocalStorage.get('jwt');

    if (token) {
      getBudget(token);
    } else {
      handleError('Token not available.');
    }
  }, []);

  const [pieChartData, setPieChartData] = useState({
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  });
  const [donutChartData, setDonutChartData] = useState({
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  });
  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [{ label: 'Budget', data: [], backgroundColor: [] }]
  });

  

  useEffect(() => {
    setPieChartData(createPieChart());
    setDonutChartData(createDonutChart());
    setBarChartData(createBarChart());
  }, [budgetData]);

  const getBudget = async (token) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/get_budget?token=${token}`);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.ok === 1) {
        setBudgetData(data.budgetData);
        setIncome(data.income);
        setSavings(data.savings);
      } else {
        throw new Error(data.message || "Error in data response.");
      }
    } catch (error) {
      handleError(`Network Error: ${error.message}`);
    }
  };

  const createChart = (chartData) => {
    if (!Array.isArray(chartData) || chartData.length === 0) {
      return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
    }
    const labels = chartData.map(item => item.title);
    const data = chartData.map(item => item.budget);
    const backgroundColors = chartData.map(item => item.color || 'gray');
    return { labels, datasets: [{ data, backgroundColor: backgroundColors }] };
  };
// Common chart options for Pie and Donut charts
const chartOptions = {
  plugins: {
    datalabels: {
      color: '#fff',
      anchor: 'end',
      align: 'start',
      offset: -10,
      font: {
        size: 12,
        weight: 'bold'
      },
      formatter: (value, context) => `${context.chart.data.labels[context.dataIndex]}: $${value}`
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.chart.data.labels[context.dataIndex];
          const value = context.raw;
          return `${label}: $${value}`;
        }
      }
    }
  }
};

// Additional options specific to the Donut chart
const donutChartOptions = {
  ...chartOptions,
  cutout: '50%' // This creates the donut shape
};

  const createPieChart = () => createChart(budgetData);
  const createDonutChart = () => createChart(budgetData);
  const createBarChart = () => createChart(budgetData);

  const addToBudget = async () => {
    const token = reactLocalStorage.get('jwt');
    const requestBody = { title, budget, color };

    try {
      const url = `${BACKEND_URL}/api/add_budget?token=${token}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data && data.ok === 1) {
        setBudgetData([...budgetData, { title, budget, color }]);
      } else {
        handleError(data.message || "Error: Unknown error.");
      }
    } catch (error) {
      handleError(`Network Error: ${error.message}`);
    }
  };

  const deleteFromBudget = async (titleToDelete) => {
    const token = reactLocalStorage.get('jwt');
    const requestBody = { title: titleToDelete, token }; // Include token in the request body
  
    try {
      const response = await fetch(`${BACKEND_URL}/api/delete_from_budget`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
  
      const data = await response.json();
      if (data && data.ok === 1) {
        setBudgetData(budgetData.filter(item => item.title !== titleToDelete));
      } else {
        handleError(data.error || "Error: Unknown error."); // Consistent error message format
      }
    } catch (error) {
      handleError(`Network Error: ${error.message}`);
    }
  };
  

  const updateIncome = async () => {
    const token = reactLocalStorage.get('jwt');
    const requestBody = { token, income };

    try {
      const response = await fetch(`${BACKEND_URL}/api/update_income`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data && data.ok === 1) {
        setIncome(data.income);
      } else {
        handleError(data.error || "Error: Unknown error.");
      }
    } catch (error) {
      handleError(`Network Error: ${error.message}`);
    }
  };

  const updateSavings = async () => {
    const token = reactLocalStorage.get('jwt');
    const requestBody = { token, savings };

    try {
      const response = await fetch(`${BACKEND_URL}/api/update_savings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data && data.ok === 1) {
        setSavings(data.savings);
      } else {
        handleError(data.error || "Error: Unknown error.");
      }
    } catch (error) {
      handleError(`Network Error: ${error.message}`);
    }
  };




  const handleError = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage('');
    }, 5000);
  };

  return (
    <div className="dashboard">
      <h1>My Budget Dashboard</h1>

      {/* Error Message */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* Income */}
      <div className="income">
        <h2>Income</h2>
        <input
          type="number"
          placeholder="Enter Income"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
        />
        <button onClick={updateIncome}>Update</button>
      </div>

      {/* Savings */}
      <div className="savings">
        <h2>Savings</h2>
        <input
          type="number"
          placeholder="Enter Savings"
          value={savings}
          onChange={(e) => setSavings(e.target.value)}
        />
        <button onClick={updateSavings}>Update</button>
      </div>

      {/* Add to Budget */}
      <div className="add-to-budget">
        <h2>Add to Budget</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
        <input
          type="text"
          placeholder="Color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <button onClick={addToBudget}>Add</button>
      </div>

      {/* Budget Items */}
    {/* Budget Items */}
    <div className="budget-items">
      <h2>Budget Items</h2>
      <ul>
        {/* Check if budgetData is an array before mapping */}
        {Array.isArray(budgetData) && budgetData.map((item) => (
          <li key={item.title}>
            {item.title}: ${item.budget}{' '}
            <button onClick={() => deleteFromBudget(item.title)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>

      
    <div className="chart-container">
        <h2>Budget Distribution (Pie Chart)</h2>
        <Pie data={pieChartData} options={chartOptions} key={JSON.stringify(pieChartData)} />
      </div>

      <div className="chart-container">
        <h2>Budget Distribution (Bar Chart)</h2>
        <Bar data={barChartData} key={JSON.stringify(barChartData)} />
      </div>

      <div className="chart-container">
        <h2>Budget Distribution (Donut Chart)</h2>
        <Pie data={donutChartData} options={donutChartOptions} key={JSON.stringify(donutChartData)} />
      </div>
    </div>

  );
}

export default Dashboard;
