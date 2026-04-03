import time
import functools
import inspect
import json
import uuid
from datetime import date, datetime
from typing import Any, Callable
from app.core.logger import get_logger

logger = get_logger("DeepLogger")

# Global state to enable/disable deep logging
ENABLED = False

def set_deep_logging(enabled: bool):
    global ENABLED
    ENABLED = enabled
    if enabled:
        logger.info("Deep Logging ACTIVATED. Preparing for high-fidelity execution trace.")

class DeepLoggerEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle non-serializable objects in logs."""
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, uuid.UUID):
            return str(obj)
        if hasattr(obj, "model_dump"): # Handle Pydantic/SQLModel
            return obj.model_dump()
        return str(obj)

def serialize(data: Any) -> str:
    try:
        return json.dumps(data, cls=DeepLoggerEncoder, indent=2)
    except Exception:
        return str(data)

def deeplog(func: Callable):
    """
    An Aspect-Oriented Logging Decorator.
    Captures:
    - Input parameters (args, kwargs)
    - Execution time (high precision)
    - Output / Return value
    - Exceptions and stack traces
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if not ENABLED:
            return func(*args, **kwargs)

        # Generate a unique trace ID for this execution branch
        trace_id = str(uuid.uuid4())[:8]
        func_name = f"{func.__module__}.{func.__name__}"
        
        # Capture Inputs
        sig = inspect.signature(func)
        bound_args = sig.bind_partial(*args, **kwargs)
        bound_args.apply_defaults()
        
        input_data = serialize(bound_args.arguments)
        
        logger.debug(f"[TRACE:{trace_id}] >>> ENTER: {func_name}")
        logger.debug(f"[TRACE:{trace_id}] INPUTS:\n{input_data}")
        
        start_time = time.perf_counter()
        try:
            result = func(*args, **kwargs)
            end_time = time.perf_counter()
            duration = (end_time - start_time) * 1000 # Convert to ms
            
            # Capture Outputs
            output_data = serialize(result)
            
            logger.debug(f"[TRACE:{trace_id}] <<< EXIT: {func_name} | TIME: {duration:.2f}ms")
            logger.debug(f"[TRACE:{trace_id}] OUTPUT:\n{output_data}")
            
            return result
        except Exception as e:
            end_time = time.perf_counter()
            duration = (end_time - start_time) * 1000
            logger.error(f"[TRACE:{trace_id}] !!! FAIL: {func_name} | TIME: {duration:.2f}ms")
            logger.error(f"[TRACE:{trace_id}] ERROR: {str(e)}")
            raise

    return wrapper
