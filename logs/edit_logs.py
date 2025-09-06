import csv
import os
from datetime import datetime

LOG_FILE_PATH = os.path.join('logs', 'edit_logs.csv')

# Make sure logs directory exists
os.makedirs('logs', exist_ok=True)

# Function to initialize CSV with headers if not exists
def initialize_log_file():
    if not os.path.isfile(LOG_FILE_PATH):
        with open(LOG_FILE_PATH, mode='w', newline='') as file:
            writer = csv.writer(file)
            # Write headers
            writer.writerow([
                'log_id', 'timestamp', 'user_role', 'user_id', 
                'edited_record_id', 'previous_value', 'new_value', 'edit_reason'
            ])

# Function to append a log entry
def add_edit_log(log_id, user_role, user_id, edited_record_id, previous_value, new_value, edit_reason=''):
    initialize_log_file()
    
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    with open(LOG_FILE_PATH, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([
            log_id, timestamp, user_role, user_id,
            edited_record_id, previous_value, new_value, edit_reason
        ])

# Example usage:
if __name__ == '__main__':
    add_edit_log(
        log_id=1,
        user_role='teacher',
        user_id=102,
        edited_record_id=456,
        previous_value='Absent',
        new_value='Present',
        edit_reason='Correction of wrong attendance'
    )
    print(f'Log entry added to {LOG_FILE_PATH}')
