import { CATEGORIES } from "../constants.js";
import { getState } from "../state.js";
import { getCategoryExpenseData } from "../selectors.js";
import {
  formatMoney,
  monthKey,
} from "../utils.js";
import { els } from "./elements.js";

let cashFlowChart = null;
let categoryChart = null;

function buildMonthlyChartData(monthCount) {
  const { transactions } = getState();
  const now = new Date();
  const months = [];

  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    months.push({
      key: monthKey(date),
      label: new Intl.DateTimeFormat("vi-VN", {
        month: "short",
      }).format(date),
    });
  }

  return months.map((month) => {
    const monthTransactions = transactions.filter((item) =>
      item.date.startsWith(month.key)
    );

    const income = monthTransactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expense = monthTransactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      ...month,
      income,
      expense,
    };
  });
}

export function renderCashFlowChart() {
  const monthCount = Number(els.chartRange.value || 6);
  const monthly = buildMonthlyChartData(monthCount);

  cashFlowChart?.destroy();

  cashFlowChart = new Chart(
    document.getElementById("cashFlowChart"),
    {
      type: "bar",
      data: {
        labels: monthly.map((item) => item.label),
        datasets: [
          {
            label: "Thu",
            data: monthly.map((item) => item.income),
            backgroundColor: "#2c9c6a",
            borderRadius: 8,
            maxBarThickness: 28,
          },
          {
            label: "Chi",
            data: monthly.map((item) => item.expense),
            backgroundColor: "#df5a67",
            borderRadius: 8,
            maxBarThickness: 28,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              boxWidth: 8,
              boxHeight: 8,
            },
          },
          tooltip: {
            callbacks: {
              label(context) {
                return ` ${context.dataset.label}: ${formatMoney(context.raw)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: "#7b8190" },
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: "#edf0f4" },
            ticks: {
              color: "#7b8190",
              callback(value) {
                if (value >= 1_000_000) {
                  return `${value / 1_000_000}tr`;
                }

                if (value >= 1_000) {
                  return `${value / 1_000}k`;
                }

                return value;
              },
            },
          },
        },
      },
    }
  );
}

export function renderCategoryChart() {
  const data = getCategoryExpenseData();

  const labels = data.length
    ? data.map((item) => item.label)
    : ["Chưa có dữ liệu"];

  const values = data.length
    ? data.map((item) => item.value)
    : [1];

  const colors = data.length
    ? data.map((item) => item.color)
    : ["#e6e8ed"];

  categoryChart?.destroy();

  categoryChart = new Chart(
    document.getElementById("categoryChart"),
    {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderWidth: 0,
            spacing: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label(context) {
                if (!data.length) {
                  return " Chưa có dữ liệu";
                }

                return ` ${context.label}: ${formatMoney(context.raw)}`;
              },
            },
          },
        },
      },
    }
  );

  els.categoryLegend.innerHTML = data.length
    ? data
        .slice(0, 6)
        .map(
          (item) => `
            <div class="legend-item">
              <span
                class="legend-dot"
                style="background:${item.color}"
              ></span>
              <span class="legend-label">${item.label}</span>
              <span class="legend-value">
                ${formatMoney(item.value)}
              </span>
            </div>
          `
        )
        .join("")
    : `
      <div class="legend-item">
        <span
          class="legend-dot"
          style="background:#e6e8ed"
        ></span>
        <span class="legend-label">Chưa có khoản chi</span>
        <span class="legend-value">0 ₫</span>
      </div>
    `;
}

export function renderCharts() {
  renderCashFlowChart();
  renderCategoryChart();
}
