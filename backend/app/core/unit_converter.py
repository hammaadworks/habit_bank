from typing import Dict, Any, Set
from app.core.logger import get_logger
from app.core.deeplogger import deeplog

logger = get_logger(__name__)

class UnitConverter:
    TIME_UNITS = {
        "second": 1,
        "seconds": 1,
        "sec": 1,
        "s": 1,
        "minute": 60,
        "minutes": 60,
        "min": 60,
        "m": 60,
        "hour": 3600,
        "hours": 3600,
        "hr": 3600,
        "h": 3600,
        "day": 86400,
        "days": 86400,
        "d": 86400,
        "week": 604800,
        "weeks": 604800,
        "w": 604800,
        "month": 2592000,
        "months": 2592000,
        "mo": 2592000,
        "year": 31536000,
        "years": 31536000,
        "y": 31536000
    }

    @staticmethod
    @deeplog
    def validate_hierarchy(hierarchy: Dict[str, Any], start_units: Set[str]) -> bool:
        """
        Validates that all provided start units eventually resolve to a time base,
        and ensures no unit has multiple conflicting paths to a time base.
        """
        for unit in start_units:
            paths_to_time = UnitConverter._find_all_paths_to_time(unit, hierarchy)
            if not paths_to_time:
                logger.error(f"Unit {unit} has no path to a time base.")
                return False
            if len(paths_to_time) > 1:
                # Check if all paths resolve to the same value
                results = set()
                for path in paths_to_time:
                    try:
                        results.add(round(UnitConverter.to_base_units(1, unit, hierarchy, visited_path=path), 6))
                    except ValueError:
                        continue
                if len(results) > 1:
                    logger.error(f"Unit {unit} has ambiguous/conflicting paths to time: {results}")
                    return False
        return True

    @staticmethod
    def _find_all_paths_to_time(unit: str, hierarchy: Dict[str, Any], visited: Set[str] = None) -> list:
        if visited is None:
            visited = set()
        
        unit_lower = unit.lower()
        if unit_lower in UnitConverter.TIME_UNITS:
            return [[unit]]
        
        if unit in visited or unit not in hierarchy:
            return []
        
        visited.add(unit)
        all_paths = []
        for next_unit in hierarchy[unit].keys():
            sub_paths = UnitConverter._find_all_paths_to_time(next_unit, hierarchy, visited.copy())
            for p in sub_paths:
                all_paths.append([unit] + p)
        return all_paths

    @staticmethod
    @deeplog
    def to_base_units(value: float, unit_name: str, hierarchy: Dict[str, Any], base_unit: str = "seconds", visited: Set[str] = None, visited_path: list = None) -> float:
        """
        Recursively converts a value to the base unit (seconds) using the given hierarchy.
        Prevents infinite loops using a 'visited' set.
        """
        if visited is None:
            visited = set()
            
        unit_lower = unit_name.lower()
        
        # Base case: if it's already a standard time unit
        if unit_lower in UnitConverter.TIME_UNITS:
            seconds = value * UnitConverter.TIME_UNITS[unit_lower]
            return seconds

        if unit_name in visited:
            raise ValueError(f"Circular dependency detected in unit hierarchy at {unit_name}")
            
        visited.add(unit_name)

        if unit_name not in hierarchy:
            raise ValueError(f"Unknown unit or no path to time base: {unit_name}")

        conversions = hierarchy[unit_name]
        
        # If a specific path is provided (for validation), follow it
        if visited_path and len(visited_path) > 1:
            next_unit = visited_path[1]
            if next_unit in conversions:
                return UnitConverter.to_base_units(value * conversions[next_unit], next_unit, hierarchy, base_unit, visited.copy(), visited_path[1:])

        # Try each path in the hierarchy
        for next_unit, multiplier in conversions.items():
            try:
                result = UnitConverter.to_base_units(value * multiplier, next_unit, hierarchy, base_unit, visited.copy())
                return result
            except ValueError:
                continue
                
        raise ValueError(f"Could not resolve {unit_name} down to a time base")

    @staticmethod
    def is_time_unit(unit_name: str) -> bool:
        return unit_name.lower() in UnitConverter.TIME_UNITS

    @staticmethod
    def get_valid_units(hierarchy: Dict[str, Any]) -> Set[str]:
        """
        Returns a set of all valid unit names for a given hierarchy,
        including all standard time units.
        """
        valid_units = set(hierarchy.keys())
        valid_units.update(UnitConverter.TIME_UNITS.keys())
        for targets in hierarchy.values():
            valid_units.update(targets.keys())
        return valid_units

    @staticmethod
    @deeplog
    def from_base_units(seconds: float, target_unit: str, hierarchy: Dict[str, Any]) -> float:
        """
        Converts a value from base units (seconds) to a target unit.
        """
        target_lower = target_unit.lower()
        if target_lower in UnitConverter.TIME_UNITS:
            return seconds / UnitConverter.TIME_UNITS[target_lower]
        
        # For custom units, we need the reciprocal of to_base_units(1, target_unit, ...)
        try:
            multiplier = UnitConverter.to_base_units(1, target_unit, hierarchy)
            return seconds / multiplier
        except ValueError:
            raise ValueError(f"Could not convert from seconds to {target_unit}")
