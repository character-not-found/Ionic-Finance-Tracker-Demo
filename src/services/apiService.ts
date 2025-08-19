/**
 * @file apiService.ts
 * @description A service for making API calls to the FastAPI backend.
 */

import { ManagementRecord } from "../pages/ManagementPage";

const getApiBaseUrl = () => {
  // Check if the current hostname is localhost
  if (window.location.hostname === 'localhost') {
    // If it is, use localhost with the backend port
    return 'http://localhost:8500';
  } else {
    // If it's a different IP (like from Ionic's live-reload), use that IP
    // with the backend port.
    // window.location.protocol returns "http:" or "https:"
    return `${window.location.protocol}//${window.location.hostname}:8500`;
  }
};

const API_BASE_URL = "https://demotuk.duckdns.org";

interface UserCredentials {
  username: string;
  password: string;
}

export interface DashboardSummary {
  netProfitLoss: number;
  monthlyDailyIncomeAvg: number;
  cashOnHand: number;
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
}


export interface CategoryChartData {
    labels: string[];
    datasets: {
        data: number[];
        backgroundColor: string[];
        hoverBackgroundColor: string[];
    }[];
}

export interface IncomeData {
  doc_id?: number;
  income_date: string;
  tours_revenue_eur: number | '';
  transfers_revenue_eur: number | '';
  hours_worked: number | '';
  daily_total_eur?: number;
  timestamp?: string;
}

export interface DailyExpenseData {
    doc_id?: number;
    cost_date: string;
    amount: number | '';
    description: string;
    category: string;
    payment_method: string;
    timestamp?: string;
}

export interface FixedCostData {
    doc_id?: number;
    cost_date: string;
    amount_eur: number | '';
    description: string;
    cost_frequency: string;
    category: string;
    recipient: string;
    payment_method: string;
    timestamp?: string;
}

export interface GlobalSummary {
  total_global_income: number;
  total_global_expenses: number;
  net_global_profit: number;
  incomeColors: string[];
  expenseColors: string[];
}

const softerRedHues = [
  '#CD5C5C',
  '#E57373',
  '#FFB6C1',
  '#FFA07A',
  '#FA8072',
  '#F08080',
  '#E9967A',
  '#DB7093',
  '#FFD1DC',
  '#BC8F8F'
];

const softerGreenHues = [
  '#8BC34A',
  '#AED581',
  '#C5E1A5',
  '#DCE775',
  '#9CCC65',
  '#7CB342'
];

const apiService = {
  /**
   * Logs a user into the application by calling the backend API.
   * @param user The user object containing username and password.
   * @returns A promise that resolves to true if login is successful, false otherwise.
   */
  loginUser: async (user: UserCredentials): Promise<boolean> => {
    try {
      // Create a URLSearchParams object to format the data as x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', user.username);
      formData.append('password', user.password);

      const response = await fetch(`${API_BASE_URL}/login/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        console.error('Login failed with status:', response.status, 'Error:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Failed to connect to the login API:', error);
      return false;
    }
  },

    /**
   * Fetches dashboard summary data from the backend API.
   * This function encapsulates all the API calls and initial data processing.
   * @returns A promise that resolves to a DashboardSummary object.
   */
  fetchDashboardSummary: async (year: number, month: number): Promise<DashboardSummary> => {
    try {
      const headers = {
        credentials: 'include',
        'Content-Type': 'application/json',
      };
      
      const today = new Date();
      const safeMonth = month || today.getMonth() + 1; 
      const safeYear = year || today.getFullYear();

      // Create start and end dates for the current month in YYYY-MM-DD format
      const startDate = new Date(safeYear, safeMonth - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(safeYear, safeMonth, 0).toISOString().split('T')[0];

      const monthlySummaryPromise = fetch(`${API_BASE_URL}/summary/monthly?year=${safeYear}&month=${safeMonth}`, { headers }).then(res => res.json());
      const dailyIncomeAveragePromise = fetch(`${API_BASE_URL}/summary/daily-income-average?start_date=${startDate}&end_date=${endDate}`, { headers }).then(res => res.json());
      const cashOnHandPromise = fetch(`${API_BASE_URL}/summary/cash-on-hand`, { headers }).then(res => res.json());

      const [monthlySummary, dailyIncomeAverage, cashOnHand] = await Promise.all([monthlySummaryPromise, dailyIncomeAveragePromise, cashOnHandPromise]);

      const dashboardSummary: DashboardSummary = {
        netProfitLoss: monthlySummary.net_monthly_profit,
        monthlyDailyIncomeAvg: dailyIncomeAverage.daily_average_income,
        cashOnHand: cashOnHand.balance,
        totalMonthlyIncome: monthlySummary.total_monthly_income,
        totalMonthlyExpenses: monthlySummary.total_monthly_expenses,
      };
      return dashboardSummary;
    } catch (error) {
      console.error('Failed to fetch dashboard summary data:', error);
      return {
        netProfitLoss: 0,
        monthlyDailyIncomeAvg: 0,
        cashOnHand: 0,
        totalMonthlyIncome: 0,
        totalMonthlyExpenses: 0,
      };
    }
  },

  fetchMonthlyIncomeByCategory: async (year: number, month: number): Promise<CategoryChartData> => {
    const safeYear = year || new Date().getFullYear();
    const safeMonth = month || new Date().getMonth() + 1;;

    const headers = {
        'Content-Type': 'application/json',
        credentials: 'include',
    };

    const response = await fetch(`${API_BASE_URL}/summary/income-sources?year=${safeYear}&month=${safeMonth}`, { headers });

    if (!response.ok) {
        throw new Error('Failed to fetch income categories summary');
    }

    const rawData = await response.json();

    const labels = Object.keys(rawData);
    const data = Object.values(rawData) as number[];

    return {
        labels: labels,
        datasets: [{
            data: data,
            backgroundColor: softerGreenHues.slice(0, labels.length),
            hoverBackgroundColor: softerGreenHues.slice(0, labels.length),
        }]
    };
  },

  fetchMonthlyExpenseByCategory: async (year: number, month: number): Promise<CategoryChartData> => {
    const safeYear = year || new Date().getFullYear();
    const safeMonth = month || new Date().getMonth() + 1;
    const headers = {
        credentials: 'include',
        'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_BASE_URL}/summary/expense-categories?year=${safeYear}&month=${safeMonth}`, { headers });

    if (!response.ok) {
        throw new Error('Failed to fetch expense categories summary');
    }

    const rawData = await response.json();

    const labels = Object.keys(rawData);
    const data = Object.values(rawData) as number[];

    return {
        labels: labels,
        datasets: [{
            data: data,
            backgroundColor: softerRedHues.slice(0, labels.length),
            hoverBackgroundColor: softerRedHues.slice(0, labels.length),
        }]
    };
  },

  /**
   * Registers a new income entry.
   * @param incomeData The income data object.
   * @returns A promise that resolves to true if registration is successful, false otherwise.
   */
  registerIncome: async (incomeData: IncomeData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/income/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include',
        },
        body: JSON.stringify(incomeData),
      });

      if (response.ok) {
        return true;
      } else {
        console.error('Income registration failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Network error during income registration:', error);
      return false;
    }
  },

  /**
   * Registers a new daily expense entry.
   * @param expenseData The daily expense data object.
   * @returns A promise that resolves to true if registration is successful, false otherwise.
   */
  registerDailyExpense: async (expenseData: DailyExpenseData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/daily-expenses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include',
        },
        body: JSON.stringify(expenseData),
      });

      if (response.ok) {
        return true;
      } else {
        console.error('Daily expense registration failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Network error during daily expense registration:', error);
      return false;
    }
  },

  /**
   * Registers a new fixed cost entry.
   * @param costData The fixed cost data object.
   * @returns A promise that resolves to true if registration is successful, false otherwise.
   */
  registerFixedCost: async (costData: FixedCostData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/fixed-costs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include',          
        },
        body: JSON.stringify(costData),
      });

      if (response.ok) {
        return true;
      } else {
        console.error('Fixed cost registration failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Network error during fixed cost registration:', error);
      return false;
    }
  },
  
  fetchGlobalSummary: async (): Promise<GlobalSummary | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/summary/global`, {
        headers: {
          "Content-Type": 'application/json',
          credentials: 'include',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      const data: GlobalSummary = await response.json();
      console.log("Global summary fetched successfully:", data);
      return {
        ...data,
        incomeColors: softerGreenHues,
        expenseColors: softerRedHues
      };
    } catch (error) {
      console.error('Network error while fetching global summary:', error);
      return null;
    }
  },

  getLatestIncomeRecords: async (): Promise<(IncomeData & { doc_id: number })[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/income/all-individual`, {
        headers: {
          "Content-Type": 'application/json',
          credentials: 'include',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      const data: (IncomeData & { doc_id: number })[] = await response.json();
      console.log("All individual income records fetched successfully:", data);

      const sortedData = data.sort((a, b) => {
          const dateComparison = new Date(b.income_date).getTime() - new Date(a.income_date).getTime();
          if (dateComparison !== 0) {
              return dateComparison;
          }
          return b.doc_id - a.doc_id;
      });
      const slicedData = sortedData.slice(0, 20);
      console.log("Sorted income records:", slicedData);
      return slicedData;
    } catch (error) {
      console.error('Network error while fetching income records:', error);
      return [];
    }
  },

  getLatestDailyExpenses: async (): Promise<(DailyExpenseData & { doc_id: number })[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/daily-expenses/`, {
        headers: {
          "Content-Type": 'application/json',
          credentials: 'include',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      const data: (DailyExpenseData & { doc_id: number })[] = await response.json();
      console.log("All daily expense records fetched successfully:", data);

      const sortedData = data.sort((a, b) => {
        const dateComparison = new Date(b.cost_date).getTime() - new Date(a.cost_date).getTime();
        if (dateComparison !== 0) {
          return dateComparison;
        }
        return b.doc_id - a.doc_id;
      });
      const slicedData = sortedData.slice(0, 20);
      console.log("Sorted daily expense records:", slicedData);
      return slicedData;
    } catch (error) {
      console.error('Network error while fetching daily expenses:', error);
      return [];
    }
  },

  getLatestFixedCosts: async (): Promise<(FixedCostData & { doc_id: number })[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/fixed-costs/`, {
        headers: {
          "Content-Type": 'application/json',
          credentials: 'include',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      const data: (FixedCostData & { doc_id: number })[] = await response.json();
      console.log("All fixed cost records fetched successfully:", data);

      const sortedData = data.sort((a, b) => {
          const dateComparison = new Date(b.cost_date).getTime() - new Date(a.cost_date).getTime();
          if (dateComparison !== 0) {
              return dateComparison;
          }
          return b.doc_id - a.doc_id;
      });
      const slicedData = sortedData.slice(0, 20);
      console.log("Sorted fixed cost records:", slicedData);
      return slicedData;
    } catch (error) {
      console.error('Network error while fetching fixed costs:', error);
      return [];
    }
  },

/**
 * Updates an existing record for a given data type.
 * @param record The record data object to update.
 * @param dataType The type of record ('income', 'daily_expense', or 'fixed').
 * @returns A promise that resolves to true if the update is successful, false otherwise.
 */
  updateRecord: async (record: ManagementRecord): Promise<boolean> => {
    if (record.doc_id === undefined) {
      console.error('Error: Cannot update a record without a doc_id.');
      return false;
    }

    let endpoint = '';
    const headers = {
      "Content-Type": 'application/json',
      credentials: 'include',
    };

    let payload;

    switch (record.dataType) {
      case 'income':
        endpoint = `${API_BASE_URL}/income/${record.doc_id}`;
        payload = record
        break;
      case 'daily_expense': {
        endpoint = `${API_BASE_URL}/daily-expenses/${record.doc_id}`;
        const { doc_id: _dailyExpenseDocId, dataType: _dailyExpenseDataType, ...dailyExpensePayload } = record;
        payload = dailyExpensePayload;
        break;
      }
      case 'fixed': {
        endpoint = `${API_BASE_URL}/fixed-costs/${record.doc_id}`;
        const { doc_id: _fixedCostDocId, dataType: _fixedCostDataType, ...fixedCostPayload } = record;
        payload = fixedCostPayload;
        break;
      }
      default:
        console.error('Invalid data type provided for update.');
        return false;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`Successfully updated ${record.dataType} record with doc_id: ${record.doc_id}`);
        return true;
      } else {
        const errorData = await response.json();
        console.error(`Failed to update ${record.dataType} record with status: ${response.status}`, errorData);
        return false;
      }
    } catch (error) {
      console.error('Network error during record update:', error);
      return false;
    }
  },  
  
/**
 * Deletes an existing record for a given data type.
 * @param doc_id The ID of the record to delete.
 * @param dataType The type of record ('income', 'daily_expense', or 'fixed').
 * @returns A promise that resolves to true if the deletion is successful, false otherwise.
 */
  deleteRecord: async (record: ManagementRecord): Promise<boolean> => {
    if (record.doc_id === undefined) {
      console.error('Error: Cannot delete a record without a doc_id.');
      return false;
    }

    let endpoint = '';
    const headers = {
      "Content-Type": 'application/json',
      credentials: 'include',
    };

    switch (record.dataType) {
      case 'income':
        endpoint = `${API_BASE_URL}/income/${record.doc_id}`;
        break;
      case 'daily_expense':
        endpoint = `${API_BASE_URL}/daily-expenses/${record.doc_id}`;
        break;
      case 'fixed':
        endpoint = `${API_BASE_URL}/fixed-costs/${record.doc_id}`;
        break;
      default:
        console.error('Invalid data type provided for delete.');
        return false;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: headers,
      });

      if (response.ok) {
        console.log(`Successfully deleted ${record.dataType} record with doc_id: ${record.doc_id}`);
        return true;
      } else {
        const errorData = await response.json();
        console.error(`Failed to delete ${record.dataType} record with status: ${response.status}`, errorData);
        return false;
      }
    } catch (error) {
      console.error('Network error during record deletion:', error);
      return false;
    }
  },

  /**
   * Registers a new user by calling the backend API.
   * @param user The user object containing username and password.
   * @returns A promise that resolves to true if registration is successful, false otherwise.
   
  registerUser: async (user: User): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        return true;
      } else {
        console.error('Registration failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Failed to connect to the registration API:', error);
      return false;
    }
  },*/
};

export default apiService;
