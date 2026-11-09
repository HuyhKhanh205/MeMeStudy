import { useWindowDimensions } from 'react-native';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isLandscape: boolean;
  isTablet: boolean;
  columns: 1 | 2 | 3;
}

/**
 * Hook phản hồi kích thước và hướng màn hình theo thời gian thực.
 *
 * Quy tắc xác định thiết bị & hướng:
 * - `isLandscape = width > height`: màn hình đang nằm ngang.
 * - `isTablet = Math.min(width, height) >= 600`: cạnh ngắn >= 600dp (iPad / Android Tablet).
 *
 * Quy tắc tính số cột (`columns`) cho các danh sách thẻ (RoundList, History, QuestionList, ExamList):
 * - `columns = 3`: Tablet xoay ngang rộng (`isTablet && isLandscape && width >= 1100`) hoặc cửa sổ Web rất rộng (`width >= 1100`).
 * - `columns = 2`: Tablet dọc (`isTablet`), hoặc điện thoại xoay ngang / cửa sổ ngang rộng (`(isLandscape && width >= 680) || width >= 720`).
 * - `columns = 1`: Điện thoại dọc hoặc màn hình hẹp còn lại.
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const shortEdge = Math.min(width, height);
  const isTablet = shortEdge >= 600;

  let columns: 1 | 2 | 3 = 1;
  if ((isTablet && isLandscape && width >= 1100) || width >= 1100) {
    columns = 3;
  } else if (isTablet || (isLandscape && width >= 680) || width >= 720) {
    columns = 2;
  }

  return {
    width,
    height,
    isLandscape,
    isTablet,
    columns,
  };
}

