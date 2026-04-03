import pytest
from app.core.unit_converter import UnitConverter

def test_unit_converter_simple():
    hierarchy = {
        "Pushup": {"seconds": 15}
    }
    assert UnitConverter.to_base_units(10, "Pushup", hierarchy) == 150

def test_unit_converter_recursive():
    hierarchy = {
        "Juz": {"Page": 20},
        "Page": {"Line": 15},
        "Line": {"seconds": 10},
        "Hour": {"minute": 60},
        "minute": {"seconds": 60}
    }
    # 1 Juz = 20 Pages = 300 Lines = 3000 seconds
    assert UnitConverter.to_base_units(1, "Juz", hierarchy) == 3000
    # 1 Hour = 60 minutes = 3600 seconds
    assert UnitConverter.to_base_units(1, "Hour", hierarchy) == 3600
    
def test_unit_converter_invalid():
    hierarchy = {
        "Pushup": {"seconds": 15}
    }
    with pytest.raises(ValueError):
        UnitConverter.to_base_units(1, "Squat", hierarchy)
