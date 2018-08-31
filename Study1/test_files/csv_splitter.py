import csv


def write_headers():
    for i in range(0, 48):
        with open('p'+str(i)+'.csv', 'w') as csvFile:
            csv_fields = ['participant', 'block_all', 'trial', 'visual', 'motor', 'block', 'target']
            writer = csv.DictWriter(csvFile, fieldnames=csv_fields)
            writer.writeheader()


def process_study_file():
    write_headers()
    csv_fields = ['participant', 'block_all', 'trial', 'visual', 'motor', 'block', 'target']
    with open('watch_transition_final.csv') as f:
        reader = csv.DictReader(f, delimiter=',')
        data = [r for r in reader]

        for entry in data:
            with open('p' + str(entry['participant']) + '.csv', 'a') as csvFile:
                writer = csv.DictWriter(csvFile, fieldnames=csv_fields)
                writer.writerow(
                    {
                        'participant': entry['participant'],
                        'block_all': entry['block_all'],
                        'trial': entry['trial'],
                        'visual': entry['visual'],
                        'motor': entry['motor'],
                        'block': entry['block'],
                        'target': entry['target']
                    }
                )


process_study_file()

