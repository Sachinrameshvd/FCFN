def calculate_expiry(item_name, category, zone, vendor_type):
    """
    Rule-based expiry calculation with zone penalties.
    """
    base_days = {
        'Vegetable': 5,
        'Fruit': 7,
        'Dairy': 4,
        'Greens': 3
    }.get(category, 5)

    # Zone penalties (Front is warmest, Back is coolest)
    zone_modifier = {
        'front': -1,
        'middle': 0,
        'back': 2
    }.get(zone, 0)

    # Vendor modifier (Street vendor produce often lacks cold-chain)
    vendor_modifier = -1 if vendor_type == 'street' else 0

    total_days = base_days + zone_modifier + vendor_modifier
    return max(1, total_days)

def check_airflow_risk(zone, item_name):
    """
    Warns if items are moved to poor airflow spots.
    """
    if zone == 'front' and 'Milk' in item_name:
        return "Warning: Milk in front zone is at high risk due to temperature fluctuations."
    return None
