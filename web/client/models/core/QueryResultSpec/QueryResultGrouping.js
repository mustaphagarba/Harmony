// @flow
import * as Zen from 'lib/Zen';
import Granularity from 'models/core/wip/Granularity';
import GroupingDimension from 'models/core/wip/GroupingItem/GroupingDimension';
import {
  formatDateByGranularity,
  formatDatesByGranularity,
} from 'util/dateUtil';
import type { GroupingItem } from 'models/core/wip/GroupingItem/types';
import type { Serializable } from 'lib/Zen';

type Values = {
  /** The id of this grouping. E.g. 'RegionName', 'timestamp' */
  id: string,

  /**
   * The label of this grouping. E.g. RegionName's label is 'Region'. This can
   * also be user-editable (e.g. in AQT). If the label is undefined, then we
   * default to a string from our translation file.
   */
  label: string | void,

  /**
   * The way we want to format the display values. E.g. if the type is 'DATE',
   * the displayValueFormat might be the granularity (e.g. day or month). If
   * the display value format is 'DEFAULT' then we just display the values as
   * we receive them from the backend.
   */
  displayValueFormat: string | 'DEFAULT',

  /** The type of this grouping. E.g. 'RegionName' is a 'STRING' type */
  type: 'STRING' | 'DATE',
};

type DerivedValues = {
  /**
   * The display label of this grouping. This is derived from the `label`.
   * If the label is undefined, then we default to a string from our translation
   * files. If a translation does not exist, then we throw an error.
   * If the `label` is not undefined, then we just use it as is.
   */
  displayLabel: string,
};

type SerializedQueryResultGrouping = {
  id: string,
  type: 'STRING' | 'DATE',
  label: string | null,
  displayValueFormat: string | 'DEFAULT',
};

export const TIMESTAMP_GROUPING_ID = 'timestamp';

const DIMENSION_TEXT = t('select_granularity');

class QueryResultGrouping
  extends Zen.BaseModel<QueryResultGrouping, Values, {}, DerivedValues>
  implements Serializable<SerializedQueryResultGrouping> {
  static derivedConfig = {
    displayLabel: [
      Zen.hasChanged<QueryResultGrouping>('label'),
      grouping => {
        if (grouping.label() === undefined) {
          const id = grouping.id();
          if (id in DIMENSION_TEXT) {
            return DIMENSION_TEXT[id];
          }
          throw new Error(
            `[QueryResultGrouping] A translation does not exist for ${id}`,
          );
        }
        return grouping.label();
      },
    ],
  };

  static createNationGrouping(): Zen.Model<QueryResultGrouping> {
    return QueryResultGrouping.create({
      id: 'nation',
      type: 'STRING',
      label: undefined,
      displayValueFormat: 'DEFAULT',
    });
  }

  static fromGroupingItem(
    groupingItem: GroupingItem,
  ): Zen.Model<QueryResultGrouping> {
    if (groupingItem instanceof GroupingDimension) {
      const groupingDimension = Zen.cast<GroupingDimension>(groupingItem);
      const dimension = groupingItem.dimension();
      return QueryResultGrouping.create({
        id: dimension.id(),
        type: 'STRING',
        displayValueFormat: 'DEFAULT',
        label: groupingDimension.name(),
      });
    }

    if (groupingItem instanceof Granularity) {
      const granularity = Zen.cast<Granularity>(groupingItem);

      // all time granularities are given the same id because this is
      // what the backend uses as the id of date columns
      return QueryResultGrouping.create({
        id: TIMESTAMP_GROUPING_ID,
        type: 'DATE',
        displayValueFormat: granularity.id(),
        label: granularity.name(),
      });
    }

    throw new Error('[QueryResultGrouping] Invalid grouping item instance');
  }

  formatGroupingValues(
    values: $ReadOnlyArray<string | number>,
    useGraphDateFormat: boolean,
    displayEthiopianDatesIfEt: boolean = true,
    simplifyDates: boolean = false,
  ): Array<string> {
    if (this._.type() === 'DATE') {
      // We can't just use formatGroupingValue below as if simplifyDates is true
      // then the date formatting is dependent on the prior date.
      return formatDatesByGranularity(
        values.map(value => value.toString()),
        this._.displayValueFormat(),
        useGraphDateFormat,
        displayEthiopianDatesIfEt,
        simplifyDates,
      );
    }

    return values.map(value => this.formatGroupingValue(value));
  }

  formatGroupingValue(
    value: string | number,
    useGraphDateFormat: boolean = false,
    displayEthiopianDatesIfEt: boolean = true,
  ): string {
    if (this._.type() === 'DEFAULT') {
      return value.toString();
    }

    if (this._.type() === 'DATE') {
      return formatDateByGranularity(
        value.toString(),
        this._.displayValueFormat(),
        useGraphDateFormat,
        displayEthiopianDatesIfEt,
      );
    }

    return value.toString();
  }

  static deserialize(
    values: SerializedQueryResultGrouping,
  ): Zen.Model<QueryResultGrouping> {
    const { id, type, label, displayValueFormat } = values;
    return QueryResultGrouping.create({
      id,
      type,
      displayValueFormat,
      label: label === null ? undefined : label,
    });
  }

  serialize(): SerializedQueryResultGrouping {
    const label = this._.label();
    return {
      id: this._.id(),
      displayValueFormat: this._.displayValueFormat(),
      type: this._.type(),
      label: label === undefined ? null : label,
    };
  }
}

export default ((QueryResultGrouping: any): Class<
  Zen.Model<QueryResultGrouping>,
>);
