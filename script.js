// script.js
function runSimulation() {
  // Reset output container
  const outputContainer = document.getElementById('output');
  outputContainer.innerHTML = '';

  // Your existing code for running the simulation...
  const processIdsInput = document.getElementById('process-id').value;
  const arrivalTimeInput = document.getElementById('arrival-time').value;
  const burstTimeInput = document.getElementById('burst-time').value;
  const timeQuantum = parseInt(document.getElementById('time-quantum').value);

  const processIds = processIdsInput.split(',').map(str => str.trim());
  const arrivalTime = arrivalTimeInput.split(',').map(str => parseInt(str.trim()));
  const burstTime = burstTimeInput.split(',').map(str => parseInt(str.trim()));

  const { solvedProcessesInfo, ganttChartInfo } = rr(processIds, arrivalTime, burstTime, timeQuantum);

  const totalTimeSums = calculateTotalTimeSums(ganttChartInfo);
  const rectangleWidths = calculateRectangleWidths(ganttChartInfo);
  const ganttChartContainer = createGanttChart(ganttChartInfo, solvedProcessesInfo, processIds, rectangleWidths);

  const ganttChartHeading = document.createElement('h2');
  ganttChartHeading.textContent = 'Gantt Chart';

  const tableHeading = document.createElement('h2');
  tableHeading.textContent = 'Table';

  outputContainer.appendChild(ganttChartHeading);
  outputContainer.appendChild(ganttChartContainer);
  displayTotalTimeSums(totalTimeSums);
  outputContainer.appendChild(tableHeading);

  const allJobIds = ganttChartInfo.map(item => item.job);
  const table = createTable(solvedProcessesInfo, timeQuantum, processIds, allJobIds);
  outputContainer.appendChild(table);
}



function calculateTotalTimeSums(ganttChartInfo) {
  const totalTimeSums = [];
  let totalTimeSum = 0;

  ganttChartInfo.forEach((item, index) => {
    totalTimeSum += item.stop - item.start;
    totalTimeSums.push(totalTimeSum);
  });  

  totalTimeSums.unshift(0); 
  return totalTimeSums; 
}


function calculateRectangleWidths(ganttChartInfo) {
  // Example: Set all rectangle widths to 50 pixels
  return ganttChartInfo.map(item => 50);
}



function displayOutput(solvedProcessesInfo, ganttChartInfo, processIds, timeQuantum, totalTimeSums, rectangleWidths) {
  const outputContainer = document.getElementById('output');
  outputContainer.innerHTML = '';

  const allJobIds = ganttChartInfo.map(item => item.job); // Extract all job IDs from ganttChartInfo

  // Add heading for Gantt Chart
  const ganttChartHeading = document.createElement('h2');
  ganttChartHeading.textContent = 'Gantt Chart';
  outputContainer.appendChild(ganttChartHeading);

  // Create Gantt Chart container and append it
  const ganttChart = document.createElement('div');
  ganttChart.className = 'output-container';
  ganttChart.appendChild(createGanttChart(ganttChartInfo, solvedProcessesInfo, processIds, rectangleWidths, totalTimeSums)); // Pass rectangleWidths and totalTimeSums to createGanttChart
  outputContainer.appendChild(ganttChart);

  // Add heading for Table
  const tableHeading = document.createElement('h2');
  tableHeading.textContent = 'Table';
  outputContainer.appendChild(tableHeading);

  // Create Table container and append it
  const table = document.createElement('div');
  table.className = 'output-container';
  table.appendChild(createTable(solvedProcessesInfo, timeQuantum, processIds, allJobIds)); // Pass solvedProcessesInfo, timeQuantum, processIds, and allJobIds to createTable
  outputContainer.appendChild(table);
}


function createGanttChart(ganttChartInfo, solvedProcessesInfo, processIds, rectangleWidths) {
  const ganttChartContainer = document.createElement('div');
  ganttChartContainer.className = 'gantt-chart';

  ganttChartInfo.forEach((item, index) => {
    const processIndex = processIds.indexOf(item.job);
    if (processIndex !== -1) { // Check if process index is found
      const process = solvedProcessesInfo[processIndex];

      // Create a container for each Gantt bar
      const container = document.createElement('div');
      container.className = 'gantt-bar-container';

      // Create the Gantt bar
      const div = document.createElement('div');
      div.className = 'gantt-bar';
      div.style.width = `${rectangleWidths[index]}px`; // Set the width of the Gantt bar
      div.style.backgroundColor = getRandomColor();
      div.textContent = process.job + " ";
      container.style.transform = 'translateX(25px)';
      // Append the Gantt bar to the container
      container.appendChild(div);

      // Append the container to the gantt chart container
      ganttChartContainer.appendChild(container);
    }
  });

  return ganttChartContainer;
}


function displayTotalTimeSums(totalTimeSums) {
  const totalTimeSumsContainer = document.createElement('div');
  totalTimeSumsContainer.className = 'total-time-sums-container';

  totalTimeSums.forEach((sum, index) => {
    const sumElement = document.createElement('div');
    sumElement.textContent = `${sum}`;
    sumElement.classList.add('total-time-sum');
    totalTimeSumsContainer.appendChild(sumElement);
  });

  totalTimeSumsContainer.style.transform = 'translateX(-25px)'; 
  const outputContainer = document.getElementById('output');
  outputContainer.appendChild(totalTimeSumsContainer);
}


function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


function createTable(solvedProcessesInfo, quantumTime, processIds, allJobIds) {
  const table = document.createElement('table');
  const tableHead = document.createElement('thead');
  const tableBody = document.createElement('tbody');

  const tableHeadRow = document.createElement('tr');
  ['Process ID', 'Arrival Time', 'Burst Time', 'Completion Time', 'Turnaround Time', 'Waiting Time'].forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    tableHeadRow.appendChild(th);
  });
  tableHead.appendChild(tableHeadRow);
  table.appendChild(tableHead);

  let totalTurnaroundTime = 0;
  let totalWaitingTime = 0;

  solvedProcessesInfo.forEach((item, index) => {
    const row = document.createElement('tr');
    ['job', 'at', 'bt', 'ft', 'tat', 'wat'].forEach(key => {
      const td = document.createElement('td');
      if (key === 'tat') {
        // Calculate Turnaround Time
        const completionTime = parseInt(item['ft']);
        const arrivalTime = parseInt(item['at']);
        const turnaroundTime = completionTime - arrivalTime;
        td.textContent = `${completionTime} - ${arrivalTime} = ${turnaroundTime}`;
        totalTurnaroundTime += turnaroundTime;
      } else if (key === 'wat') {
        // Calculate Waiting Time
        const completionTime = parseInt(item['ft']);
        const arrivalTime = parseInt(item['at']);
        let remainder = 0;

        // Calculate remainder based on occurrence of process ID in allJobIds
        const jobId = item['job'];
        const occurrence = allJobIds.filter(id => id === jobId).length;
        remainder = (occurrence - 1) * quantumTime;

        const turnaroundTime = completionTime - arrivalTime;
        const waitingTime = Math.max(turnaroundTime - remainder - arrivalTime, 0); // Ensure waiting time is non-negative
        td.textContent = `${turnaroundTime} - ${remainder} - ${arrivalTime} = ${waitingTime}`;
        totalWaitingTime += waitingTime;
      } else {
        td.textContent = item[key];
      }
      row.appendChild(td);
    });
    tableBody.appendChild(row);
  });

  // Calculate averages
  const avgTurnaroundTime = totalTurnaroundTime / solvedProcessesInfo.length;
  const avgWaitingTime = totalWaitingTime / solvedProcessesInfo.length;

  // Create row for displaying averages
  const avgRow = document.createElement('tr');

  // Empty cell to span over the first four columns
  const emptyCell = document.createElement('td');
  emptyCell.colSpan = 4;
  emptyCell.style.textAlign = 'right';
  emptyCell.textContent = 'Average';
  avgRow.appendChild(emptyCell);

  // Create cell for Average Turnaround Time
  const avgTurnaroundTimeTd = document.createElement('td');
  avgTurnaroundTimeTd.textContent = `${totalTurnaroundTime} / ${solvedProcessesInfo.length} = ${avgTurnaroundTime.toFixed(2)}`;
  avgRow.appendChild(avgTurnaroundTimeTd);

  // Create cell for Average Waiting Time
  const avgWaitingTimeTd = document.createElement('td');
  avgWaitingTimeTd.textContent = `${totalWaitingTime} / ${solvedProcessesInfo.length} = ${avgWaitingTime.toFixed(2)}`;
  avgRow.appendChild(avgWaitingTimeTd);

  tableBody.appendChild(avgRow);

  table.appendChild(tableBody);

  return table;
}











