from frappe import _

def get_data():
	return {
		'fieldname': 'opportunity',
		'non_standard_fieldnames': {
			'Quotation': 'opportunity'
		},
		'transactions': [
			{
				'items': ['Student Applicant']
			},
		]
	}