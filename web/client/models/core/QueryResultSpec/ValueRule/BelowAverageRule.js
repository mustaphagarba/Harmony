// @flow
import * as Zen from 'lib/Zen';
import { getAverage } from 'models/core/QueryResultSpec/ValueRule/rulesUtil';
import type { Serializable } from 'lib/Zen';
import type { TestableRule } from 'models/core/QueryResultSpec/ValueRule/types';

type SerializedBelowAverageRule = {
  type: 'BELOW_AVERAGE',
};

const TEXT = t('models.core.QueryResultSpec.ValueRule');

/**
 * Test if a value is below the average value of an array of numbers.
 */
class BelowAverageRule extends Zen.BaseModel<BelowAverageRule, {}>
  implements Serializable<SerializedBelowAverageRule>, TestableRule {
  tag: 'BELOW_AVERAGE' = 'BELOW_AVERAGE';

  static deserialize(): Zen.Model<BelowAverageRule> {
    return BelowAverageRule.create({});
  }

  testValue(val: ?number, allValues: $ReadOnlyArray<?number>): boolean {
    if (val === null || val === undefined) {
      return false;
    }
    const avg = getAverage(allValues);
    return val < avg;
  }

  getRuleString(allValues: $ReadOnlyArray<?number>): string {
    return `${TEXT.values} < ${getAverage(allValues).toFixed(2)}`;
  }

  serialize(): SerializedBelowAverageRule {
    return {
      type: this.tag,
    };
  }
}

export default ((BelowAverageRule: any): Class<Zen.Model<BelowAverageRule>>);
