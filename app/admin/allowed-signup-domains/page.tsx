import ResourceDataPage from '@/app/admin/_components/ResourceDataPage'

export default function AllowedSignupDomainsPage() {
  return (
    <ResourceDataPage
      title="Allowed Signup Domains"
      table="allowed_signup_domains"
      mode="crud"
      idField="domain"
      description="Create, read, update, and delete allowed signup domains."
    />
  )
}
