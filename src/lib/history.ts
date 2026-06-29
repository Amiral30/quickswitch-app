export interface HistoryItem {
  id: string;
  filename: string;
  toolType: string;
  details: string;
  timestamp: string;
  status: 'success' | 'error';
}

export const saveToHistory = (
  filename: string,
  toolType: string,
  details: string,
  status: 'success' | 'error' = 'success'
): void => {
  if (typeof window === 'undefined') return;
  
  let historyList: HistoryItem[] = [];
  const stored = localStorage.getItem('swiftools_history');
  
  if (stored) {
    try {
      historyList = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse history', e);
    }
  }
  
  const newItem: HistoryItem = {
    id: Math.random().toString(36).substring(2, 9),
    filename,
    toolType,
    details,
    timestamp: new Date().toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    status
  };
  
  historyList.unshift(newItem);
  
  // Cap at 50 conversion history items
  if (historyList.length > 50) {
    historyList = historyList.slice(0, 50);
  }
  
  localStorage.setItem('swiftools_history', JSON.stringify(historyList));
};
