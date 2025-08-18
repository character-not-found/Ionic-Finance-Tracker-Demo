import apiService, { DashboardSummary, GlobalSummary } from './apiService';

// The ChartData interface is moved here since these functions use it.
export interface ChartData {
    labels: string[];
    datasets: {
        data: number[];
        backgroundColor: string[];
        borderColor?: string;
        borderWidth?: number;
    }[];
}

/**
 * Fetches the dashboard summary data from the API.
 * @returns A promise that resolves with the DashboardSummary data.
 */
export const fetchDashboardSummaryData = async (year: number, month: number): Promise<DashboardSummary> => {
    console.log("Fetching dashboard summary data from service.");
    try {
        const data = await apiService.fetchDashboardSummary(year, month);
        if (!data) {
            throw new Error('No data received from API');
        }
        console.log("Service fetched summary data:", data);
        return data;
    } catch (err) {
        console.error('Failed to fetch dashboard summary data in service:', err);
        throw new Error('Failed to load dashboard summary data.');
    }
};

/**
 * Fetches the income category chart data from the API.
 * @returns A promise that resolves with the ChartData.
 */
export const fetchIncomeCategoryChartData = async (year: number, month: number): Promise<ChartData> => {
    console.log("Fetching income category data from service.");
    try {
        const data = await apiService.fetchMonthlyIncomeByCategory(year, month);
        const chartData: ChartData = {
            labels: data.labels,
            datasets: data.datasets.map(dataset => ({
                ...dataset,
                data: dataset.data.map(value => Number(value)),
            })),
        };

        console.log("Service fetched income category data:", chartData);
        return chartData;
    } catch (err) {
        console.error('Failed to fetch income category data in service:', err);
        throw new Error('Failed to load income category data.');
    }
};

/**
 * Fetches the expense category chart data from the API.
 * @returns A promise that resolves with the ChartData.
 */
export const fetchExpenseCategoryChartData = async (year: number, month: number): Promise<ChartData> => {
    console.log("Fetching expense category data from service.");
    try {
        const apiData: ChartData = await apiService.fetchMonthlyExpenseByCategory(year, month);

        const chartData: ChartData = {
            labels: apiData.labels,
            datasets: apiData.datasets.map(dataset => ({
                ...dataset,
                data: dataset.data.map(value => Number(value)),
            })),
        };

        console.log("Service fetched expense category data:", chartData);
        return chartData;
    } catch (err) {
        console.error('Failed to fetch expense category data in service:', err);
        throw new Error('Failed to load expense category data.');
    }
};

export const fetchGlobalSummaryData = async (): Promise<GlobalSummary | null> => {
    console.log("Fetching global summary data from service.");
    try {
        const data = await apiService.fetchGlobalSummary();
        if (!data) {
            throw new Error('No data received from API');
        }
        console.log("Service fetched global summary data:", data);
        return data;
    } catch (err) {
        console.error('Failed to fetch global summary data in service:', err);
        throw new Error('Failed to load global summary data.');
    }
};