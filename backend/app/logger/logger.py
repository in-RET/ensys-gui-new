import logging


class EnsysLogger:
    def __init__(self, name, filename, level=logging.INFO):
        logging.basicConfig(filename=filename,
                            format='%(asctime)s %(message)s',
                            filemode='w',
                            level=level)

        logging.getLogger(name)

    def debug(self, msg):
        logging.debug(msg=f"[----D] {msg}")

    def info(self, msg):
        logging.info(msg=f"[---I-] {msg}")

    def warn(self, msg):
        logging.warning(msg=f"[--W--] {msg}")

    def error(self, msg):
        logging.error(msg=f"[-E---] {msg}")

    def critical(self, msg):
        logging.critical(msg=f"[C----]  {msg}")
