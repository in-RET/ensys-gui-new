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
        Logs an informational message prefixed with the custom identifier "[---I-]"

        :param msg: The message to log.
        :type msg: str
        :return: None
        """
        self.logger.info(msg=f"[---I-] {msg}")

    def warn(self, msg):
        """
        Logs a warning message prefixed with the custom identifier "[--W--]".

        :param msg: The message to be logged as a warning.
        :type msg: str
        :return: None
        """
        self.logger.warning(msg=f"[--W--] {msg}")

    def error(self, msg):
        """
        Logs an error message with a prefixed format.

        :param msg: The message string to be logged.
        :type msg: str
        :return: None
        """
        self.logger.error(msg=f"[-E---] {msg}")

    def critical(self, msg):
        """
        Logs a critical severity message prefixed with the custom identifier "[C----]"

        :param msg: The message to log. It provides the content describing the
            critical issue or context.
        :type msg: str

        :return: None
        """
        self.logger.critical(msg=f"[C----]  {msg}")
