from builtins import object
import json
import os

from flask import current_app, render_template, request, url_for
from flask_user import current_user
from pylib.file.file_utils import FileUtils
from werkzeug.routing import BuildError

from config.locales import LOCALES
from config.dashboard_base import EMPTY_SPECIFICATION
from web.server.configuration.settings import (
    get_configuration,
    CRISP_ENABLED_KEY,
    CRISP_ID_KEY,
)
from web.server.environment import IS_PRODUCTION, IS_TEST, BUILD_TAG
from web.server.data.alerts import get_alert_options
from web.server.data.case_management import get_case_management_options
from web.server.data.data_upload import get_data_upload_app_options
from web.server.util.util import is_session_persisted, ISO_DATETIME_FORMAT

# HACK(stephen): The indicator property "dimension_values" is not used by the
# frontend. It adds additional size to the serialized indicators, and it is more
# difficult to serialize which slows down response times.


def _strip_dimension_values(group_definitions):
    output = []
    for group in group_definitions:
        new_group = dict(group)
        indicators = []
        for ind in group['indicators']:
            if 'dimension_values' in ind:
                ind = dict(ind)
                ind.pop('dimension_values')
            indicators.append(ind)
        new_group['indicators'] = indicators
        output.append(new_group)
    return output


def read_js_version(javascript_version_file=None):
    '''Read the JS version stamp attached when building the production JS
    bundles to improve frontend error reporting. If no version file was added,
    we do not support versioning for this deployment.
    '''
    javascript_version_file = javascript_version_file or FileUtils.GetAbsPathForFile(
        'web/public/build/version.txt'
    )
    # Only production has JS versions. If we are in production but the version
    # file does not exist, FileUtils will not resolve the absolute path and
    # will return None. Some deployments do not support versioning.
    if not IS_PRODUCTION or not javascript_version_file:
        return ''

    return FileUtils.FileContents(javascript_version_file).strip()


class TemplateRenderer(object):
    def __init__(self, configuration_module, javascript_version):
        # TODO(vedant,toshi,stephen) - The eventual goal is to NOT pass the
        # entire configuration module to this class.

        # Full Configuration Modules for UI and Aggregation
        self.ui_configuration = configuration_module.ui
        self.aggregation_configuration = configuration_module.aggregation
        self.general_configuration = configuration_module.general

        # Chat-specific Configurations
        self.enable_chat = configuration_module.chat.ENABLE_CHAT
        self.chat_host = configuration_module.chat.CHAT_HOST

        # Indicator Configurations
        self.indicator_group_definitions = _strip_dimension_values(
            configuration_module.indicators.GROUP_DEFINITIONS
        )
        self.removed_indicators = configuration_module.indicators.REMOVED_INDICATORS
        self.postgres_indicators = (
            configuration_module.postgres_indicators.GROUP_DEFINITIONS
        )

        # Locale Configurations
        self.locales = LOCALES
        self.enabled_locales = configuration_module.ui.ENABLE_LOCALES

        self.javascript_version = javascript_version

    def build_locale_params(self, dashboard=None):
        '''
        Build params for each locale, including a redirect URL to translate the
        current page (which requires the dashboard name, in case we're on a dashboard
        page)
        '''
        dashboard_name = None
        if dashboard:
            dashboard_name = dashboard.get('activeDashboard')

        ret = []
        for locale in self.enabled_locales:
            match = dict(self.locales[locale])
            try:
                match['url'] = url_for(
                    request.url_rule.endpoint, locale=locale, name=dashboard_name
                )
            except BuildError:
                # We no longer have any endpoint that serves the notfound.html
                # template. Calling url_for raises a build error for a url that
                # doesnot exist. We therefore set the url to the url path used to
                # make the request.
                match['url'] = request.path
            ret.append(match)
        return ret

    def build_ui_params(self):
        ui_configuration = self.ui_configuration
        druid_context = current_app.druid_context
        data_status = druid_context.data_status_information
        time_boundary = druid_context.data_time_boundary
        last_update_time = data_status.get_most_recent_update_time()
        return {
            'defaultLocale': ui_configuration.DEFAULT_LOCALE,
            'fullPlatformName': ui_configuration.FULL_PLATFORM_NAME,
            'lastDataUpdate': last_update_time,
            'flagClass': ui_configuration.FLAG_CLASS,
            'logoPath': ui_configuration.LOGO_PATH,
            'showLocalePicker': len(ui_configuration.ENABLE_LOCALES) > 1,
            'defaultDatePickerType': ui_configuration.DEFAULT_DATE_PICKER_TYPE,
            'userManualUrl': ui_configuration.USER_MANUAL_URL,
            'feedbackRegistration': ui_configuration.FEED_BACK_REGISTRATION_LINK,
            'maxDataDate': time_boundary.get_max_data_date(),
            'minDataDate': time_boundary.get_min_data_date(),
            'showSelectionDateRanges': ui_configuration.SHOW_SELECTION_DATE_RANGES,
            'enableDataQualityLab': ui_configuration.ENABLE_DATA_QUALITY_LAB,
            'sessionTimeout': ui_configuration.SESSION_TIMEOUT,
            'isSessionPersisted': is_session_persisted(),
        }

    def build_user_params(self):
        user_params = {
            'username': 'anonymous',
            'isAuthenticated': current_user.is_authenticated,
            'loginUrl': url_for('user.login'),
        }
        if current_user.is_authenticated:
            user_created_time = (
                current_user.created.strftime(ISO_DATETIME_FORMAT)
                if current_user.created
                else None
            )
            user_params.update(
                {
                    'username': current_user.username,
                    'isAdmin': current_user.is_superuser(),
                    'firstName': current_user.first_name,
                    'lastName': current_user.last_name,
                    'created': user_created_time,
                    'fullName': '%s %s'
                    % (current_user.first_name, current_user.last_name),
                    'logoutUrl': url_for('user.logout'),
                    'id': current_user.id,
                }
            )
        return user_params

    def build_template_params(self, locale):
        ui_configuration = self.ui_configuration
        data_status = current_app.druid_context.data_status_information
        last_update_time = data_status.get_most_recent_update_time()

        return {
            'locale': locale,
            'deployment_name': current_app.zen_config.general.DEPLOYMENT_NAME,
            'full_platform_name': ui_configuration.FULL_PLATFORM_NAME,
            'favicon_path': ui_configuration.FAVICON_PATH,
            'home_icon_path': ui_configuration.HOME_ICON_PATH,
            'enable_chat': self.enable_chat and not IS_PRODUCTION,
            'chat_host': self.chat_host,
            'last_data_update': last_update_time,
            'user': self.build_user_params(),
            'enable_crisp': get_configuration(CRISP_ENABLED_KEY),
            'crisp_chat_id': get_configuration(CRISP_ID_KEY),
            'js_version': self.javascript_version,
            'is_screenshot_request': request.args.get('screenshot') == '1',
        }

    # Build the backend js config without indicators or locations. This config
    # is small and can be passed inline in the html.

    def build_lightweight_backend_js_config(self, locale='en', dashboard=None):
        ui_configuration = self.ui_configuration
        aggregation_configuration = self.aggregation_configuration
        general_configuration = self.general_configuration
        deployment_name = general_configuration.DEPLOYMENT_NAME

        return {
            'deploymentName': deployment_name,
            'nationName': general_configuration.NATION_NAME,
            'geoFieldOrdering': aggregation_configuration.GEO_FIELD_ORDERING,
            'dimensionCategories': aggregation_configuration.DIMENSION_CATEGORIES,
            'locale': locale,
            'dashboardIsPublic': get_configuration('public_access'),
            'selectGranularityButtonOrder': ui_configuration.SELECT_GRANULARITY_BUTTON_ORDER,
            'selectGranularityDefaultLevel': ui_configuration.SELECT_GRANULARITY_DEFAULT_LEVEL,
            'showIndicatorNotes': ui_configuration.SHOW_INDICATOR_NOTES,
            'enableEtDateSelection': ui_configuration.ENABLE_ET_DATE_SELECTION,
            'filterDimensions': current_app.zen_config.filters.PUBLIC_FILTER_DIMENSIONS
            if get_configuration('public_access')
            else current_app.zen_config.filters.FILTER_DIMENSIONS,
            'filterOrder': ui_configuration.FILTER_ORDER,
            'filterOptions': ui_configuration.DEFAULT_FILTER_OPTIONS,
            'fieldOptions': ui_configuration.FIELD_OPTIONS,
            'sqtGeographyFilterDimensions': current_app.zen_config.filters.FRONTEND_CACHED_FILTER_DIMENSIONS,
            'timeseriesUseEtDates': ui_configuration.TIMESERIES_USE_ET_DATES,
            'timeseriesDefaultGranularity': ui_configuration.TIMESERIES_DEFAULT_GRANULARITY,
            'timeseriesEnabledGranularities': aggregation_configuration.ENABLED_GRANULARITIES,
            'aqtEnabledGranularites': aggregation_configuration.AQT_ENABLED_GRANULARITIES,
            'tableColumns': ui_configuration.TABLE_COLUMNS,
            'mapDefaultLatLng': ui_configuration.MAP_DEFAULT_LATLNG,
            'mapDefaultZoom': ui_configuration.MAP_DEFAULT_ZOOM,
            'geoDataOverlay': ui_configuration.GEO_DATA_URL,
            'geoDataLabels': ui_configuration.GEO_DATA_DISPLAY,
            'geoDataDimensions': ui_configuration.GEO_DATA_DIMENSIONS,
            'mapOverlayGeoJson': ui_configuration.MAP_GEOJSON_LOCATION,
            'mapboxAccessToken': ui_configuration.MAPBOX_ACCESS_TOKEN,
            'mapboxAdminURLS': ui_configuration.MAP_MAPBOX_ADMIN_URLS,
            'IS_PRODUCTION': IS_PRODUCTION,
            'IS_TEST': IS_TEST,
            'IS_DEMO': request.args.get('demo') == '1',
            'vendorScriptPath': current_app.config.get('VENDOR_SCRIPT_PATH'),
            'ui': self.build_ui_params(),
            'user': self.build_user_params(),
            'alertsOptions': get_alert_options(),
            'dataUploadAppOptions': {
                'showInNavbar': get_data_upload_app_options(
                    deployment_name, self.indicator_group_definitions
                )['showInNavbar']
            },
            'caseManagementAppOptions': get_case_management_options(
                general_configuration.DEPLOYMENT_NAME
            ),
            'fiscalStartMonth': aggregation_configuration.FISCAL_START_MONTH,
            'locales': self.build_locale_params(dashboard),
        }

    # Build the backend js config for indicators and locations. This config can be
    # very large and should ideally be passed separately from the HTML.

    def build_heavy_backend_js_config(self):
        ui_configuration = self.ui_configuration
        druid_context = current_app.druid_context
        dimension_lookup = druid_context.dimension_values_lookup

        output = {
            'defaultDashboardSpec': EMPTY_SPECIFICATION,
            'dimensionValueMap': dimension_lookup.get_dimension_value_map(),
            'geoNameMap': ui_configuration.GEO_NAME_MAP,
            'indicatorGroups': self.indicator_group_definitions,
            'removedIndicators': self.removed_indicators,
            'indicatorSelectionDropdowns': ui_configuration.QUERY_FORM_DROPDOWNS,
            'postgresIndicatorGroups': self.postgres_indicators,
            'buildTag': BUILD_TAG,
        }

        return output

    def render_helper(
        self,
        template_path,
        locale='en',
        pass_to_js=None,
        pass_to_template=None,
        lightweight_js_only=False,
    ):
        '''Render template with common template and JS params. Additional JS and
        template params can be passed through pass_to_js and pass_to_template.
        '''
        # TODO(pablo): T1825 - clean up this JSON. There are some redundant/useless values
        dashboard = None if not pass_to_js else pass_to_js.get('dashboard')
        final_pass_to_js = self.build_lightweight_backend_js_config(locale, dashboard)

        if pass_to_js:
            final_pass_to_js.update(pass_to_js)

        return self.js_render_helper(
            template_path,
            locale,
            final_pass_to_js,
            pass_to_template,
            lightweight_js_only,
        )

    def js_render_helper(
        self,
        template_path,
        locale='en',
        js_params=None,
        pass_to_template=None,
        lightweight_js_only=False,
    ):
        '''
        Render template for pages with js components. All JS params must be specified in
        js_params, and additional template params (in addition to the default ones)
        should be passed in pass_to_template
        '''
        template_params = self.build_template_params(locale)
        if js_params:
            template_params['pass_to_js'] = Serializer.serialize(js_params)
        if lightweight_js_only:
            template_params['lightweight_js_only'] = True
        if pass_to_template:
            template_params.update(pass_to_template)
        return render_template(template_path, **template_params)

    def no_js_render_helper(self, template_path, locale='en', pass_to_template=None):
        '''
        Render templates for pages with no js components. Default template params
        are used. Additional params can be passed through pass_to_template.
        '''
        template_params = self.build_template_params(locale)
        if pass_to_template:
            template_params.update(pass_to_template)
        return render_template(template_path, **template_params)


class Serializer(object):
    @staticmethod
    def serialize(obj):
        return json.dumps(obj)
