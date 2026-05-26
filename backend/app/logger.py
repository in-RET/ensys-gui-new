import logging


class EnsysLogger:
    """Simple wrapper around `logging.Logger` with prefixed messages."""
    logger = None

    def __init__(self, name, filename, level=logging.INFO):
        """Configure a logger with file output.

        - param name: logger name
        - param filename: log file path
        - param level: logging level (default INFO)
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
        """Log a debug message prefixed with `[----D]`."""
        self.logger.debug(msg=f"[----D] {msg}")

    def info(self, msg):
        """Log an info message prefixed with `[INFO-]`."""
        self.logger.info(msg=f"[INFO-] {msg}")

    def warning(self, msg):
        """Log a warning message prefixed with `[WARN-]`."""
        self.logger.warning(msg=f"[WARN-] {msg}")

    def error(self, msg):
        """Log an error message prefixed with `[ERROR]`."""
        self.logger.error(msg=f"[ERROR] {msg}")

    def critical(self, msg):
        """Log a critical message prefixed with `[CRIT-]`."""
        self.logger.critical(msg=f"[CRIT-] {msg}")
