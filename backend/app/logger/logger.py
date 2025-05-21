import logging


class EnsysLogger:
    logger = None

    def __init__(self, name, filename, level=logging.INFO):
        logging.basicConfig(
            filename=filename,
            format='%(asctime)s %(message)s',
            filemode='w',
            level=level,
            encoding='utf-8'
        )

        self.logger = logging.getLogger(name)

    def debug(self, msg):
        self.logger.debug(msg=f"[----D] {msg}")

    def info(self, msg):
        self.logger.info(msg=f"[---I-] {msg}")

    def warn(self, msg):
        self.logger.warning(msg=f"[--W--] {msg}")

    def error(self, msg):
        self.logger.error(msg=f"[-E---] {msg}")

    def critical(self, msg):
        self.logger.critical(msg=f"[C----]  {msg}")
