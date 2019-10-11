from builtins import object
import json
import logging
import os

from abc import ABCMeta, abstractmethod

import requests
from db.druid.errors import DruidQueryError
from log import LOG
from future.utils import with_metaclass

# Create a shared request session that provides connection pooling. Each worker
# process should receive its own session/pool. This is because Request's
# Session + HTTPAdapter pool is not thread safe. If multiple threads initiate a
# request at the same time, meaning two requests are in transit simultaneously,
# it is possible for data to corrupt in both threads.
# NOTE(stephen): This is a simple way to manage sessions across workers. This
# does not account for workers that are killed by gunicorn (due to exceptions
# or staleness), so multiple unused sessions could potentially accumulate.
_SESSIONS = {}


def _get_session(druid_configuration):
    pid = os.getpid()
    if pid in _SESSIONS:
        return _SESSIONS[pid]

    # Configure the connection pool settings for connections made to the
    # druid query endpoint
    # Create a connection pool
    adapter = requests.adapters.HTTPAdapter(pool_connections=30, pool_maxsize=30)
    session = requests.Session()
    session.mount(druid_configuration.query_endpoint(), adapter)
    _SESSIONS[pid] = session
    return session


class DruidQueryRunner(with_metaclass(ABCMeta, object)):
    @abstractmethod
    def run_query(self, query):
        pass

    @abstractmethod
    def run_raw_query(self, query):
        pass


class DruidQueryClient_(DruidQueryRunner):
    def __init__(self, druid_configuration, query_path='druid/v2'):
        self.query_path = query_path
        self.query_url = '%s/%s' % (druid_configuration.query_endpoint(), query_path)
        self.druid_configuration = druid_configuration

    # Run a query that inherits from db.druid.query_builder.BaseDruidQuery
    def run_query(self, query):
        pydruid_query = query.prepare()
        raw_result = self.run_raw_query(pydruid_query.query_dict)
        # Assign a value directly to the pydruid query since we have already
        # parsed the results.
        pydruid_query.result = query.parse(raw_result)
        return pydruid_query

    # Run a query built from pydruid
    def run_pydruid_query(self, pydruid_query):
        result = self.run_raw_query(pydruid_query.query_dict)
        # Skip past the .parse() method since it parses the raw json and we
        # don't need to do that. If the result_json is actually used, then
        # we will need to attach it here.
        pydruid_query.result = result
        return pydruid_query

    # Issue a fully formed query to druid
    def run_raw_query(self, query_dict):
        # If requested, log the input query before initiating the request
        # NOTE(stephen): Conditionally checking this so we don't json serialize
        # the druid query every time if it isn't going to be logged..
        if LOG.level <= logging.DEBUG:
            LOG.debug(json.dumps(query_dict, indent=2).replace('\\n', '\n'))

        # Kick off a new druid query
        r = _get_session(self.druid_configuration).post(self.query_url, json=query_dict)
        if r.status_code != requests.codes.ok:
            error_msg = 'Server response: %s' % r.content
            try:
                # "raise_for_status" will only throw an HTTPError if the
                # status code is >= 400. We still want to throw an error
                # for non 200 responses.
                r.raise_for_status()
            except requests.exceptions.HTTPError as e:
                error_msg = '%s\n%s' % (e.message, error_msg)

            raise DruidQueryError(error_msg)

        ret = r.json()
        if LOG.level <= logging.DEBUG and os.getenv('LOG_DRUID_RESPONSES'):
            LOG.debug('Received response: %s' % json.dumps(r.json(), indent=2))
        return ret

    def _post(self, pydruid_query):
        return self.run_pydruid_query(pydruid_query)


class DruidQueryClient(DruidQueryRunner):
    from db.druid.config import DruidConfig

    QUERY_PATH = 'druid/v2'
    QUERY_URL = '%s/%s' % (DruidConfig.query_endpoint(), QUERY_PATH)

    # Run a query that inherits from db.druid.query_builder.BaseDruidQuery
    @classmethod
    def run_query(cls, query):
        pydruid_query = query.prepare()
        raw_result = cls.run_raw_query(pydruid_query.query_dict)
        # Assign a value directly to the pydruid query since we have already
        # parsed the results.
        pydruid_query.result = query.parse(raw_result)
        return pydruid_query

    # Run a query built from pydruid
    @classmethod
    def run_pydruid_query(cls, pydruid_query):
        result = cls.run_raw_query(pydruid_query.query_dict)
        # Skip past the .parse() method since it parses the raw json and we
        # don't need to do that. If the result_json is actually used, then
        # we will need to attach it here.
        pydruid_query.result = result
        return pydruid_query

    # Issue a fully formed query to druid
    @classmethod
    def run_raw_query(cls, query_dict):
        from db.druid.config import DruidConfig

        # If requested, log the input query before initiating the request
        if LOG.level <= logging.DEBUG:
            LOG.debug(json.dumps(query_dict, indent=2).replace('\\n', '\n'))

        # Kick off a new druid query
        r = _get_session(DruidConfig).post(cls.QUERY_URL, json=query_dict)
        if r.status_code != requests.codes.ok:
            error_msg = 'Server response: %s' % r.content
            try:
                # "raise_for_status" will only throw an HTTPError if the
                # status code is >= 400. We still want to throw an error
                # for non 200 responses.
                r.raise_for_status()
            except requests.exceptions.HTTPError as e:
                error_msg = '%s\n%s' % (e.message, error_msg)

            raise DruidQueryError(error_msg)
        return r.json()

    @classmethod
    def _post(cls, pydruid_query):
        return cls.run_pydruid_query(pydruid_query)
