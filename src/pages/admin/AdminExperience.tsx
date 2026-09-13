import { ResourceAdmin } from '../../components/admin/ResourceAdmin'
import type { FieldDef } from '../../components/admin/fields'
import { dateRange } from '../../lib/utils'
import type { Experience } from '../../lib/types'

const FIELDS: FieldDef[] = [
  { name: 'role', label: 'Role', type: 'text', required: true },
  { name: 'company', label: 'Company', type: 'text', required: true },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'company_url', label: 'Company website', type: 'text' },
  { name: 'start_date', label: 'Start date', type: 'date' },
  { name: 'end_date', label: 'End date', type: 'date', help: 'Leave blank if this is current.' },
  { name: 'logo_url', label: 'Company logo', type: 'image', folder: 'logos', full: true },
  { name: 'description', label: 'Description', type: 'textarea', full: true },
  { name: 'currently_working', label: 'I currently work here', type: 'boolean' },
  { name: 'active', label: 'Show on the site', type: 'boolean' },
]

export default function AdminExperience() {
  return (
    <ResourceAdmin<Experience & { [key: string]: unknown }>
      title="Experience"
      description="Shown as a timeline on the homepage and About page."
      table="experiences"
      singular="Role"
      fields={FIELDS}
      requiredFields={['role', 'company']}
      primary={(row) => `${row.role} · ${row.company}`}
      secondary={(row) => dateRange(row.start_date, row.end_date, row.currently_working)}
    />
  )
}
