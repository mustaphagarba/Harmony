// @flow
import PropTypes from 'prop-types';

import Moment from 'models/core/wip/DateTime/Moment';
import ZenModel, { def } from 'util/ZenModel';
import override from 'decorators/override';

type SerializedDashboardMeta = {
  $uri: string,
  authorUsername: string,
  created: string,
  isOfficial: boolean,
  isFavorite: boolean,
  lastAccessedByCurrentUser: string,
  lastModified: string,
  lastModifiedByCurrentUser: string,
  resource: string,
  slug: string,
  title: string,
  totalViewsByUser: number,
  totalViews: number,
};

/**
 * @readonly
 * The DashboardMeta is a readonly model is used by the `DashboardService` to
 * represent all the metadata associated with a dashboard (but not the actual
 * dashboard itself).
 */
export default class DashboardMeta extends ZenModel.withTypes({
  /**
   * @readonly
   * The username of the author who created this dashboard.
   */
  author: def(PropTypes.string, '', ZenModel.PRIVATE),

  /**
   * @readonly
   * The unique uri that can be used to look up the authorization resource
   * corresponding to this dashboard.
   */
  authorizationUri: def(PropTypes.string, undefined, ZenModel.PRIVATE),

  /**
   * @readonly
   * The time at which this dashboard was created.
   */
  created: def(PropTypes.instanceOf(Moment), undefined, ZenModel.PRIVATE),

  /**
   * @readonly
   * Indicates whether or not an administrator has flagged the dashboard as
   * "official" or not.
   */
  isOfficial: def(PropTypes.bool, false, ZenModel.PRIVATE),

  /**
   * @readonly
   * Indicates whether or not the dashboard has been favorited by the current
   * user.
   */
  isFavorite: def(PropTypes.bool, false),

  /**
   * @readonly
   * The time at which any attribute of the Dashboard model was last modified.
   */
  lastModified: def(PropTypes.instanceOf(Moment), undefined, ZenModel.PRIVATE),

  /**
   * @readonly
   * The last time the dashboard was accessed (if ever) by the current user.
   */
  lastAccessedByCurrentUser: def(
    PropTypes.instanceOf(Moment),
    undefined,
    ZenModel.PRIVATE,
  ),

  /**
   * @readonly
   * The last time the dashboard was modified (if ever) by the current user.
   */
  lastModifiedByCurrentUser: def(
    PropTypes.instanceOf(Moment),
    undefined,
    ZenModel.PRIVATE,
  ),

  /**
  * @readonly
  * The number of times the dashboard has been view by the current user.
  */
  totalViewsByUser: def(PropTypes.number, 0, ZenModel.PRIVATE),

  /**
  * @readonly
  * The number of times the dashboard has been view.
  */
  totalViews: def(PropTypes.number, 0, ZenModel.PRIVATE),

  /**
   * @readonly
   * The short-name of the dashboard that the user can use to navigate
   * directly to the UI representation of the dashboard.
   */
  slug: def(PropTypes.string.isRequired, '', ZenModel.PRIVATE),

  /**
   * @readonly
   * The title of the dashboard.
   */
  title: def(PropTypes.string, '', ZenModel.PRIVATE),

  /**
   * @readonly
   * The unique uri that can be used to locate this dashboard on the server
   */
  uri: def(PropTypes.string, undefined, ZenModel.PRIVATE),
}) {
  @override
  static deserialize(values: SerializedDashboardMeta) {
    const {
      authorUsername,
      created,
      isOfficial,
      isFavorite,
      lastModified,
      lastAccessedByCurrentUser,
      lastModifiedByCurrentUser,
      slug,
      title,
      totalViewsByUser,
      totalViews,
    } = values;

    return DashboardMeta.create({
      author: authorUsername || '',
      authorizationUri: values.resource,
      uri: values.$uri,
      created: Moment.create(created),
      isOfficial,
      isFavorite,
      lastAccessedByCurrentUser: Moment.create(lastAccessedByCurrentUser),
      lastModified: Moment.create(lastModified),
      lastModifiedByCurrentUser: Moment.create(lastModifiedByCurrentUser),
      slug,
      title,
      totalViewsByUser,
      totalViews,
    });
  }
}
