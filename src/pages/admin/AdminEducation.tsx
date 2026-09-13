import { ResourceAdmin } from '../../components/admin/ResourceAdmin'
import type { FieldDef } from '../../components/admin/fields'
import { dateRange } from '../../lib/utils'
import type { Education } from '../../lib/types'

const FIELDS: FieldDef[] = [
  { name: 'degree', label: 'Degree', type: 'text', required: true },
  { name: 'institution', label: 'Institution', type: 'text', required: true },
  { name: 'field', label: 'Field of study', type: 'text' },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'start_date', label: 'Start date', type: 'date' },
  { name: 'end_date', label: 'End date', type: 'date' },
  { name: 'logo_url', label: 'Institution logo', type: 'image', folder: 'logos', full: true },
  { name: 'description', label: 'Description', type: 'textarea', full: true },
  { name: 'active', label: 'Show on the site', type: 'boolean', full: true },
]

export default function AdminEducation() {
  return (
    <ResourceAdmin<Education & { [key: string]: unknown }>
      title="Education"
      table="education"
      singular="Entry"
      fields={FIELDS}
      requiredFields={['degree', 'institution']}
      primary={(row) => row.degree}
      secondary={(row) => `${row.institution} · ${dateRange(row.start_date, row.end_date)}`}
    />
  )
}
