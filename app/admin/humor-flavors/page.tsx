import ResourceDataPage from '@/app/admin/_components/ResourceDataPage'

export default function HumorFlavorsPage() {
  return (
    <ResourceDataPage
      title="Humor Flavors"
      table="humor_flavors"
      mode="read"
      description="Read-only list of humor flavors from the source table."
    />
  )
}
