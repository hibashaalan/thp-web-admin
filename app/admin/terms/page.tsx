import ResourceDataPage from '@/app/admin/_components/ResourceDataPage'

export default function TermsPage() {
  return (
    <ResourceDataPage
      title="Terms"
      table="terms"
      mode="crud"
      description="Create, read, update, and delete terms."
    />
  )
}
