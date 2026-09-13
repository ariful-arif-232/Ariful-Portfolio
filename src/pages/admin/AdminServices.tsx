import { ResourceAdmin } from '../../components/admin/ResourceAdmin'
import type { FieldDef } from '../../components/admin/fields'
import type { Service } from '../../lib/types'

const FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  {
    name: 'icon',
    label: 'Icon',
    type: 'text',
    help: 'Try code, layout, database, settings or spark.',
  },
  { name: 'description', label: 'Description', type: 'textarea', full: true },
  { name: 'active', label: 'Show on the site', type: 'boolean', full: true },
]

export default function AdminServices() {
  return (
    <ResourceAdmin<Service & { [key: string]: unknown }>
      title="Services"
      description="The What I do section on the homepage."
      table="services"
      singular="Service"
      fields={FIELDS}
      requiredFields={['title']}
      primary={(row) => row.title}
      secondary={(row) => row.description ?? ''}
    />
  )
}
