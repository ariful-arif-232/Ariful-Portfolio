import { ResourceAdmin } from '../../components/admin/ResourceAdmin'
import type { FieldDef } from '../../components/admin/fields'
import type { SocialLink } from '../../lib/types'

const FIELDS: FieldDef[] = [
  {
    name: 'platform',
    label: 'Platform',
    type: 'select',
    options: [
      'GitHub', 'LinkedIn', 'Facebook', 'Instagram', 'X', 'YouTube', 'WhatsApp', 'Email', 'Website',
    ],
  },
  {
    name: 'url',
    label: 'URL',
    type: 'text',
    required: true,
    help: 'Full link. Use mailto: for email and https://wa.me/… for WhatsApp.',
  },
  { name: 'active', label: 'Show on the site', type: 'boolean', full: true },
]

export default function AdminSocialLinks() {
  return (
    <ResourceAdmin<SocialLink & { [key: string]: unknown }>
      title="Social links"
      description="Active links appear in the hero, contact page and footer."
      table="social_links"
      singular="Link"
      fields={FIELDS}
      requiredFields={['url']}
      primary={(row) => row.platform}
      secondary={(row) => row.url}
    />
  )
}
