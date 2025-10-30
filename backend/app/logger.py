import logging


class EnsysLogger:
    """
    Handles creation and management of a logger instance with specific configurations.

    The `EnsysLogger` class provides functionality to create a logger instance tied to
    a specific name, logging level, and a file to store log outputs. Logs are formatted
    to include a timestamp and message, ensuring traceability and readability in UTF-8
    encoded files. This class supports logging at various severity levels including debug,
    info, warning, error, and critical.

    :ivar logger: Internal logger instance used to handle logging messages.
    :type logger: logging.Logger
    """
    logger = None

    def __init__(self, name, filename, level=logging.INFO):
        """
        Initializes a logger instance with a given configuration. The logger is associated
        with a specific name, writes logs to a specified file, and operates at the defined
        logging level. The logging messages are encoded in UTF-8 format and include a
        timestamp followed by the log message.

        :param name: The name associated with the logger instance.
        :type name: str
        :param filename: The name of the file where logs will be written.
        :type filename: str
        :param level: The logging level for the logger. Defaults to logging.INFO.
        :type level: int, optional
        """
        logging.basicConfig(
            filename=filename,
            format='%(asctime)s %(message)s',
            filemode='w',
            level=level,
            encoding='utf-8'
        )

        self.logger = logging.getLogger(name)

    def debug(self, msg):
        """
        Logs a debug message prefixed with the custom identifier "[----D]"

        :param msg: The message to be logged.
        :type msg: str
        :return: None
        """
        self.logger.debug(msg=f"[----D] {msg}")

    def info(self, msg):
        """
        Logs an informational message prefixed with the custom identifier "[INFO-]".

        Used for general operational messages about program execution and state.

        :param msg: The message to be logged
        :type msg: str
        :return: None
        """
        self.logger.info(msg=f"[INFO-] {msg}")

    def warning(self, msg):
        """
        Logs a warning message prefixed with the custom identifier "[WARN-]".

        Used for potentially problematic situations that don't prevent program execution
        but should be noted.

        :param msg: The warning message to be logged
        :type msg: str
        :return: None
        """
        self.logger.warning(msg=f"[WARN-] {msg}")

    def error(self, msg):
        """
        Logs an error message prefixed with the custom identifier "[ERROR]".

        Used for error conditions that affect program execution but don't force
        termination.

        :param msg: The error message to be logged
        :type msg: str
        :return: None
        """
        self.logger.error(msg=f"[ERROR] {msg}")

    def critical(self, msg):
        """
        Logs a critical error message prefixed with the custom identifier "[CRIT-]".

        Used for severe error conditions that might lead to program termination or
        data loss.

        :param msg: The critical error message to be logged
        :type msg: str
        :return: None

        Note:
            Critical logs should be monitored and addressed immediately as they
            indicate serious system issues.
        """
        self.logger.critical(msg=f"[CRIT-] {msg}")
