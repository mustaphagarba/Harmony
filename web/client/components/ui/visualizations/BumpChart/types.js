// @flow
import type { RawTimestamp } from 'components/visualizations/BumpChart/types';

export type MutableDataPoint = {|
  key: string,
  label: string,
  rank: number,
  timestamp: RawTimestamp,
  val: number,
|};

export type DataPoint = $ReadOnly<MutableDataPoint>;
export type LineData = $ReadOnlyArray<DataPoint>;

export type ValueDomainMap = {
  [RawTimestamp]: [number, number],
};

export type ColorScaleMap = {
  [RawTimestamp]: *, // scaleLinear(...) -- Need types for @vx/scale
};

// NOTE(stephen): Seems reusable.
export type Margin = {
  bottom: number,
  left: number,
  right: number,
  top: number,
};

// NOTE(stephen): Seems reusable. Return value of @vx/event localPoint(event).
export type HoverPoint = { x: number, y: number };
