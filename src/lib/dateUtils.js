
/**
 * 格式化日期为指定格式
 * @param {Date|string} date - 日期对象或日期字符串
 * @param {string} format - 格式字符串，支持 'yyyy-MM-dd' 和 'yyyy-MM-dd HH:mm'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'yyyy-MM-dd') {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  if (format === 'yyyy-MM-dd') {
    return `${year}-${month}-${day}`;
  } else if (format === 'yyyy-MM-dd HH:mm') {
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
  
  return d.toLocaleDateString('zh-CN');
}

/**
 * 获取日期范围的开始和结束时间
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @returns {Object} 包含开始和结束时间的对象
 */
export function getDateRange(startDate, endDate) {
  if (!startDate || !endDate) return null;
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  return { from: start, to: end };
}
  