/**
 * @file apiService.ts
 * @description A service for making API calls to the FastAPI backend.
 */

import { CapacitorHttp } from "@capacitor/core";
import { setToken, getToken } from "./authService";
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
      const formData = new URLSearchParams();
      formData.append('username', user.username);
      formData.append('password', user.password);

      const response = await CapacitorHttp.post({
        url: `${API_BASE_URL}/login/token`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: formData.toString(),
      });

      if (response.status === 200 && response.data && response.data.access_token) {
          console.log('Login successful. Saving token.');
          await setToken(response.data.access_token);
          return true;
      } else {
          console.error('Login failed with status:', response.status, 'Error:', response.data);
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
      const today = new Date();
      const safeMonth = month || today.getMonth() + 1; 
      const safeYear = year || today.getFullYear();

      const token = await getToken();
      if (!token) {
          throw new Error('No authentication token available.');
      };

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
      };

      const startDate = new Date(safeYear, safeMonth - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(safeYear, safeMonth, 0).toISOString().split('T')[0];

      const fetchData = async (url: string) => {
        const response = await CapacitorHttp.get({ url, headers });
        if (response.status >= 200 && response.status < 300) {
          return response.data;
        } else {
          throw new Error(`API call to ${url} failed with status: ${response.status} and message: ${JSON.stringify(response.data)}`);
        }
      };      

      const monthlySummaryPromise = fetchData(`${API_BASE_URL}/summary/monthly?year=${safeYear}&month=${safeMonth}`);
      const dailyIncomeAveragePromise = fetchData(`${API_BASE_URL}/summary/daily-income-average?start_date=${startDate}&end_date=${endDate}`);
      const cashOnHandPromise = fetchData(`${API_BASE_URL}/summary/cash-on-hand`);

      const [monthlySummary, dailyIncomeAverage, cashOnHand] = await Promise.all([
        monthlySummaryPromise,
        dailyIncomeAveragePromise,
        cashOnHandPromise,
      ]);

      if (!monthlySummary || !dailyIncomeAverage || !cashOnHand) {
          throw new Error('One or more summary data components were missing from the API response.');
      }

      const dashboardSummary: DashboardSummary = {
        netProfitLoss: monthlySummary.net_monthly_profit,
        monthlyDailyIncomeAvg: dailyIncomeAverage.daily_average_income,
        cashOnHand: cashOnHand.balance,
        totalMonthlyIncome: monthlySummary.total_monthly_income,
        totalMonthlyExpenses: monthlySummary.total_monthly_expenses,
      };

      console.log('Dashboard summary fetched successfully:', dashboardSummary);
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
    try {
      const safeYear = year || new Date().getFullYear();
      const safeMonth = month || new Date().getMonth() + 1;
      const token = await getToken();
      if (!token) {
          throw new Error('No authentication token available.');
      };

      const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
      };

      const response = await CapacitorHttp.get({
        url: `${API_BASE_URL}/summary/income-sources?year=${safeYear}&month=${safeMonth}`,
        headers: headers,
      });

      if (response.status === 200 && response.data) {
        const rawData = await response.data;

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
      } else {
        const errorMessage = `Failed to fetch income category data with status: ${response.status}, message: ${JSON.stringify(response.data)}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Network error while fetching income category data:', error);
      throw error;
    }
  },

  fetchMonthlyExpenseByCategory: async (year: number, month: number): Promise<CategoryChartData> => {
    try {    
      const safeYear = year || new Date().getFullYear();
      const safeMonth = month || new Date().getMonth() + 1;
      const token = await getToken();
      if (!token) {
          throw new Error('No authentication token available.');
      };

      const response = await CapacitorHttp.get({
        url: `${API_BASE_URL}/summary/expense-categories?year=${safeYear}&month=${safeMonth}`,
        headers: {
          'Authorization': `Bearer ${token}`,        
        }
      });

      if (response.status === 200 && response.data) {
        const rawData = await response.data;

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
      } else {
        const errorMessage = `Failed to fetch expense category data with status: ${response.status}, message: ${JSON.stringify(response.data)}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Network error while fetching expense category data:', error);
      throw error;
    }
  },

  /**
   * Registers a new income entry.
   * @param incomeData The income data object.
   * @returns A promise that resolves to true if registration is successful, false otherwise.
   */
  registerIncome: async (data: IncomeData): Promise<boolean> => {
    try {
      const token = await getToken();
      if (!token) {
          throw new Error('No authentication token available.');
      };

      const response = await CapacitorHttp.post({
        url: `${API_BASE_URL}/income/`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        data: JSON.stringify(data),
      });

      if (response.status >= 200 && response.status < 300 && response.data) {
        console.log('Income added successfully:', response.data);
        return true;
      } else {
        const errorMessage = `Failed to add income with status: ${response.status}, message: ${JSON.stringify(response.data)}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Network error while adding income:', error);
      throw error;
    }
  },

  /**
   * Registers a new daily expense entry.
   * @param expenseData The daily expense data object.
   * @returns A promise that resolves to true if registration is successful, false otherwise.
   */
  registerDailyExpense: async (data: DailyExpenseData): Promise<boolean> => {
    try {
      const token = await getToken();
      if (!token) {
          throw new Error('No authentication token available.');
      };

      const response = await CapacitorHttp.post({
        url: `${API_BASE_URL}/daily-expenses/`,         
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        data: data,
      });

      if (response.status >= 200 && response.status < 300 && response.data) {
        console.log('Daily Expense added successfully:', response.data);
        return true;
      } else {
        const errorMessage = `Failed to add daily expense with status: ${response.status}, message: ${JSON.stringify(response.data)}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Network error while adding daily expense:', error);
      throw error;
    }
  },

  /**
   * Registers a new fixed cost entry.
   * @param costData The fixed cost data object.
   * @returns A promise that resolves to true if registration is successful, false otherwise.
   */
  registerFixedCost: async (data: FixedCostData): Promise<boolean> => {
    try {
      const token = await getToken();
      if (!token) {
          throw new Error('No authentication token available.');
      }

      const response = await CapacitorHttp.post({
        url: `${API_BASE_URL}/fixed-costs/`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        data: data,
      });

      if (response.status >= 200 && response.status < 300 && response.data) {
        console.log('Fixed Cost added successfully:', response.data);
        return true;
      } else {
        const errorMessage = `Failed to add fixed cost with status: ${response.status}, message: ${JSON.stringify(response.data)}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Network error while adding fixed cost:', error);
      throw error;
    }
  },
  
  fetchGlobalSummary: async (): Promise<GlobalSummary | null> => {
    try {
      const token = await getToken();
      if (!token) {
          throw new Error('No authentication token available.');
      }

      const response = await CapacitorHttp.get({
        url: `${API_BASE_URL}/summary/global`,
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.status === 200 && response.data && typeof response.data === 'object') {
        console.log("Global summary fetched successfully:", response.data);
        const data: GlobalSummary = await response.data;
        return {
          ...data,
          incomeColors: softerGreenHues,
          expenseColors: softerRedHues
        }
      } else {
        const errorMessage = `API call failed with status: ${response.status}, message: ${JSON.stringify(response.data)}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Network error while fetching global summary:', error);
      throw error;
    }
  },

  getLatestIncomeRecords: async (): Promise<(IncomeData & { doc_id: number })[]> => {
    try {
      const token = await getToken();
      if (!token) {
          throw new Error('No authentication token available.');
      }

      const response = await CapacitorHttp.get({
        url: `${API_BASE_URL}/income/all-individual`,
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.status >= 200 && response.status < 300) {
        if (response.data && Array.isArray(response.data)) {
            console.log("All individual income records fetched successfully:", response.data);

            const sortedData = response.data.sort((a, b) => {
              const dateComparison = new Date(b.income_date).getTime() - new Date(a.income_date).getTime();
              if (dateComparison !== 0) {
                  return dateComparison;
              }
            return b.doc_id - a.doc_id;
          });

          const slicedData = sortedData.slice(0, 20);
          console.log("Sorted income records:", slicedData);
          return slicedData;
        } else {
          console.error('API response for income records was empty or malformed.');
          return [];
        }
      } else {
        throw new Error(`API call failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Network error while fetching income records:', error);
      return [];
    }
  },

  getLatestDailyExpenses: async (): Promise<(DailyExpenseData & { doc_id: number })[]> => {
    try {
      const token = await getToken();
      if (!token) {
          throw new Error('No authentication token available.');
      }

      const response = await CapacitorHttp.get({
        url: `${API_BASE_URL}/daily-expenses/`,
        headers: {
          'Authorization': `Bearer ${token}`,
        }        
      });

      if (response.status >= 200 && response.status < 300) {
        if (response.data && Array.isArray(response.data)) {
          console.log("All daily expense records fetched successfully:", response.data);

          const sortedData = response.data.sort((a, b) => {
            const dateComparison = new Date(b.cost_date).getTime() - new Date(a.cost_date).getTime();
            if (dateComparison !== 0) {
              return dateComparison;
            }
            return b.doc_id - a.doc_id;
          });

          const slicedData = sortedData.slice(0, 20);
          console.log("Sorted daily expense records:", slicedData);
          return slicedData;
        } else {
          console.error('API response for daily expenses was empty or malformed.');
          return [];
        }
      } else {
        throw new Error(`API call failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Network error while fetching daily expenses:', error);
      return [];
    }
  },

  getLatestFixedCosts: async (): Promise<(FixedCostData & { doc_id: number })[]> => {
    try {
      const token = await getToken();
      if (!token) {
          throw new Error('No authentication token available.');
      }

      const response = await CapacitorHttp.get({
        url: `${API_BASE_URL}/fixed-costs/`,
        headers: {
          'Authorization': `Bearer ${token}`,
        }  
      });

      if (response.status >= 200 && response.status < 300) {
        if (response.data && Array.isArray(response.data)) {
          console.log("All fixed cost records fetched successfully:", response.data);

          const sortedData = response.data.sort((a, b) => {
            const dateComparison = new Date(b.cost_date).getTime() - new Date(a.cost_date).getTime();
            if (dateComparison !== 0) {
              return dateComparison;
            }
            return b.doc_id - a.doc_id;
          });

          const slicedData = sortedData.slice(0, 20);
          console.log("Sorted fixed cost records:", slicedData);
          return slicedData;
        } else {
          console.error('API response for fixed costs was empty or malformed.');
          return [];
        }
      } else {
        throw new Error(`API call failed with status: ${response.status}`);
      }
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

    const token = await getToken();
      if (!token) {
          throw new Error('No authentication token available.');
    }

    let endpoint = '';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
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
      const response = await CapacitorHttp.put({
        url: endpoint,
        method: 'PUT',
        headers: headers,
        data: payload,
      });

      if (response.status >= 200 && response.status < 300) {
        console.log(`Successfully updated ${record.dataType} record with doc_id: ${record.doc_id}`);
        return true;
      } else {
        const errorData = response.data;
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

    const token = await getToken();
      if (!token) {
          throw new Error('No authentication token available.');
    }

    let endpoint = '';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
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
      const response = await CapacitorHttp.delete({
        url: endpoint,
        method: 'DELETE',
        headers: headers,
      });

      if (response.status >= 200 && response.status < 300) {
          console.log(`Successfully deleted ${record.dataType} record with doc_id: ${record.doc_id}`);
          return true;
      } else {
          const errorData = response.data;
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
