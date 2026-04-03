import logging
import sys
from pathlib import Path

# Define log file path
LOG_FILE = Path("habit_bank.log")

class ColorFormatter(logging.Formatter):
    """
    Custom logging formatter that adds ANSI colors to terminal output.
    """
    grey = "\x1b[38;20m"
    blue = "\x1b[34;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    format_str = "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"

    FORMATS = {
        logging.DEBUG: grey + format_str + reset,
        logging.INFO: blue + format_str + reset,
        logging.WARNING: yellow + format_str + reset,
        logging.ERROR: red + format_str + reset,
        logging.CRITICAL: bold_red + format_str + reset
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)

def setup_logging():
    """
    Configures the application-wide logging.
    
    Logs are written to both the console (with colors) and a file (plain text).
    """
    # Create console handler with colors
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(ColorFormatter())

    # Create file handler without colors
    plain_formatter = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"
    )
    file_handler = logging.FileHandler(LOG_FILE)
    file_handler.setFormatter(plain_formatter)

    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Avoid adding multiple handlers if setup_logging is called more than once
    if not root_logger.handlers:
        root_logger.addHandler(console_handler)
        root_logger.addHandler(file_handler)

    # Suppress some noisy third-party logs
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    logging.info("Logging initialized. Outputting to console (colored) and 'habit_bank.log'.")

def set_debug_level():
    """Sets the root logger to DEBUG level."""
    logging.getLogger().setLevel(logging.DEBUG)
    logging.info("Global Log Level switched to DEBUG.")

def get_logger(name: str):
    """
    Returns a logger instance with the specified name.
    """
    return logging.getLogger(name)
