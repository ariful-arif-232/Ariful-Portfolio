import { ResourceAdmin } from '../../components/admin/ResourceAdmin'
import type { FieldDef } from '../../components/admin/fields'
import type { Skill } from '../../lib/types'

const FIELDS: FieldDef[] = [
  { name: 'name', label: 'Skill name', type: 'text', required: true },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: ['Frontend', 'Backend', 'Database', 'Tools', 'Design', 'Other'],
  },
  {
    name: 'icon',
    label: 'Icon',
    type: 'text',
    help: 'Optional icon name, for example code, database or layout.',
  },
  {
    name: 'level',
    label: 'Level',
    type: 'number',
    help: 'Optional 0-100. Leave blank and no meter is shown.',
  },
  { name: 'active', label: 'Show on the site', type: 'boolean', full: true },
]

export default function AdminSkills() {
  return (
    <ResourceAdmin<Skill & { [key: string]: unknown }>
      title="Skills"
      description="Grouped by category on the homepage, in the order set here."
      table="skills"
      singular="Skill"
      fields={FIELDS}
      requiredFields={['name']}
      primary={(row) => row.name}
      secondary={(row) => row.category}
    />
  )
}
