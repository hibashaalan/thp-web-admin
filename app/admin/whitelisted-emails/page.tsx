import ResourceDataPage from '@/app/admin/_components/ResourceDataPage'

export default function WhitelistedEmailsPage() {
  return (
    <ResourceDataPage
      title="Whitelisted E-mail Addresses"
      table="whitelisted_emails"
      mode="crud"
      idField="email"
      description="Create, read, update, and delete whitelisted e-mail addresses."
    />
  )
}
