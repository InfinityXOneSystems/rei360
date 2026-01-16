"""REI360 Python SDK - Shared utilities for all Python-based services"""

import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import json

from google.cloud import secretmanager, pubsub_v1, sql_connector
from google.auth import default
import psycopg2
from psycopg2.pool import SimpleConnectionPool

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ConfigManager:
    """Manage configuration from environment and Secret Manager"""

    def __init__(self, project_id: str = None):
        self.project_id = project_id or os.getenv('GCP_PROJECT_ID', 'infinity-x-one-systems')
        self.environment = os.getenv('ENVIRONMENT', 'dev')
        self.system_prefix = 'rei360'

    def get_secret(self, secret_id: str) -> str:
        """Retrieve secret from Google Secret Manager"""
        try:
            client = secretmanager.SecretManagerServiceClient()
            secret_name = f"projects/{self.project_id}/secrets/{self.system_prefix}-{secret_id}-{self.environment}/versions/latest"
            response = client.access_secret_version(request={"name": secret_name})
            return response.payload.data.decode('UTF-8')
        except Exception as e:
            logger.warning(f"Failed to get secret {secret_id}: {e}. Using env var fallback.")
            return os.getenv(secret_id.upper().replace('-', '_'), '')

    def get(self, key: str, default: str = None) -> str:
        """Get configuration value from environment or Secret Manager"""
        # Try environment variable first
        env_key = key.upper().replace('-', '_')
        if env_key in os.environ:
            return os.environ[env_key]

        # Try Secret Manager if environment is prod
        if self.environment == 'prod':
            secret_value = self.get_secret(key)
            if secret_value:
                return secret_value

        return default or ''


class DatabaseConnection:
    """Manage PostgreSQL connections with pooling"""

    def __init__(self, config: ConfigManager, db_name: str = 'rei360_property'):
        self.config = config
        self.db_name = db_name
        self.pool = None
        self._init_pool()

    def _init_pool(self):
        """Initialize connection pool"""
        # Get database credentials
        db_url = self.config.get('database-url')

        if not db_url:
            # Build connection string from components
            host = self.config.get('db-host', 'localhost')
            port = self.config.get('db-port', '5432')
            user = self.config.get('db-user', 'rei360_user')
            password = self.config.get('db-password', 'password')

            db_url = f"postgresql://{user}:{password}@{host}:{port}/{self.db_name}"

        try:
            self.pool = SimpleConnectionPool(1, 20, db_url)
            logger.info(f"Database connection pool initialized for {self.db_name}")
        except Exception as e:
            logger.error(f"Failed to initialize connection pool: {e}")
            raise

    def get_connection(self):
        """Get a connection from the pool"""
        if self.pool is None:
            self._init_pool()
        return self.pool.getconn()

    def return_connection(self, conn):
        """Return a connection to the pool"""
        if self.pool:
            self.pool.putconn(conn)

    def close_all(self):
        """Close all connections in the pool"""
        if self.pool:
            self.pool.closeall()


class PubSubManager:
    """Manage Pub/Sub publishing and subscribing"""

    def __init__(self, config: ConfigManager):
        self.config = config
        self.project_id = config.project_id
        self.publisher = pubsub_v1.PublisherClient()
        self.subscriber = pubsub_v1.SubscriberClient()

    def publish(self, topic: str, message: Dict[str, Any]) -> str:
        """Publish a message to a Pub/Sub topic"""
        topic_path = self.publisher.topic_path(self.project_id, topic)
        message_json = json.dumps(message).encode('utf-8')

        try:
            future = self.publisher.publish(topic_path, data=message_json)
            message_id = future.result()
            logger.debug(f"Published message {message_id} to {topic}")
            return message_id
        except Exception as e:
            logger.error(f"Failed to publish to {topic}: {e}")
            raise

    def subscribe(self, topic: str, callback, num_messages: int = None):
        """Subscribe to a Pub/Sub topic"""
        subscription_path = self.subscriber.subscription_path(
            self.project_id,
            f"{topic}-sub"
        )

        streaming_pull_future = self.subscriber.subscribe(
            subscription_path,
            callback=callback
        )

        logger.info(f"Listening for messages on {subscription_path}")

        try:
            streaming_pull_future.result()
        except KeyboardInterrupt:
            streaming_pull_future.cancel()


class HealthChecker:
    """Health check utilities"""

    @staticmethod
    def create_response(status: str = 'ok', details: Dict = None) -> Dict:
        """Create a health check response"""
        return {
            'status': status,
            'timestamp': datetime.utcnow().isoformat(),
            'version': os.getenv('SERVICE_VERSION', '1.0.0'),
            'details': details or {}
        }


class ErrorHandler:
    """Centralized error handling"""

    @staticmethod
    def handle_exception(e: Exception, context: str = ''):
        """Log and handle exceptions"""
        logger.error(f"Error in {context}: {str(e)}", exc_info=True)
        return {
            'error': str(e),
            'context': context,
            'timestamp': datetime.utcnow().isoformat()
        }


# Export public API
__all__ = [
    'ConfigManager',
    'DatabaseConnection',
    'PubSubManager',
    'HealthChecker',
    'ErrorHandler'
]
