// @flow
import moment from 'moment';
import { extent, max } from 'd3-array';
import { scaleLinear, scaleTime, scaleOrdinal } from '@vx/scale';

import type {
  DataPoint,
  VerticalAxisStartPoint,
} from 'components/ui/visualizations/LineGraph/types';

export function createDateFormatter(dateFormat: string) {
  return (date: string | Date) => moment(date).format(dateFormat);
}

export const extractDate = (d: DataPoint): Date => d.date;

export const extractValue = (d: DataPoint): number => d.value;

const clampMonth = (month: number): number => Math.max(0, Math.min(month, 11));

function offsetDateByMonths(date: Date, monthCount: number): Date {
  const dateCopy = new Date(date.getTime());
  const newMonth = clampMonth(dateCopy.getMonth() + monthCount);
  const newDate = dateCopy.setMonth(newMonth);
  return new Date(newDate);
}

/**
 * Offsets the minimum and the maximum dates by 1 month, to prevent 1st and last
 * points from extending beyond the available space for the graph
 * @param {array} dateExtent A tuple containing the minimum and maximum date
 * TODO:(Dennis)-Find a dynamic way of offsetting the date on the x-axis
 * Offsetting by month in all cases might not solve the problem in some cases
 */
function offsetDateExtentByMonth(
  dateExtent: $ReadOnlyArray<Date>,
): $ReadOnlyArray<Date> {
  const [startDate, endDate] = dateExtent;
  return [offsetDateByMonths(startDate, -1), offsetDateByMonths(endDate, 1)];
}

/**
 * Creates a function to offset the minimum and the maximum value
 * to prevent the graph from extending beyond the vertical space
 * available
 * @param {number} offset The fraction to consider while offsetting the
 * minimum and maximum values
 */
export function createOffsetFunction(offset: number) {
  return (valueToOffset: number, index: number | string): number => {
    const isMinValue = Number(index) === 0;
    if (isMinValue) {
      return valueToOffset * (1 - offset);
    }
    return valueToOffset * (1 + offset);
  };
}

export function computeXScale(data: $ReadOnlyArray<DataPoint>, width: number) {
  const dateExtent = extent(data, extractDate);
  const offsetExtent = offsetDateExtentByMonth(dateExtent);
  const xScale = scaleTime({
    range: [0, width],
    domain: offsetExtent,
  });
  return xScale;
}

export function computeYScale(
  data: $ReadOnlyArray<DataPoint>,
  height: number,
  verticalAxisStartPoint: VerticalAxisStartPoint = 'zero',
) {
  let valueExtent;
  const minMaxOffset = 0.2;
  const offsetValue = createOffsetFunction(minMaxOffset);

  if (verticalAxisStartPoint === 'min') {
    valueExtent = extent(data, extractValue).map(offsetValue);
  } else if (verticalAxisStartPoint === 'zero') {
    valueExtent = [0, max(data, extractValue)].map(offsetValue);
  }

  const yScale = scaleLinear({
    range: [height, 0],
    domain: valueExtent,
  });

  return yScale;
}

/**
 * Creates a scale which when given a string part of the domain, will map it
 * to the color within the range
 * @param {Array} domain An array of strings which are to be mapped to colors
 * @param {Array} range An array of colors to which strings will be mapped
 */
export function computeColorScale(
  domain: $ReadOnlyArray<string>,
  range: $ReadOnlyArray<string>,
) {
  return scaleOrdinal({
    domain,
    range,
  });
}
