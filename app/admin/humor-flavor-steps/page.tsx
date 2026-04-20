import ResourceDataPage from '@/app/admin/_components/ResourceDataPage'

export default function HumorFlavorStepsPage() {
  return (
    <ResourceDataPage
      title="Humor Flavor Steps"
      table="humor_flavor_steps"
      mode="read"
      description="Read-only list of humor flavor execution steps."
    />
  )
}
