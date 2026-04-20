import ResourceDataPage from '@/app/admin/_components/ResourceDataPage'

export default function CaptionExamplesPage() {
  return (
    <ResourceDataPage
      title="Caption Examples"
      table="caption_examples"
      mode="crud"
      description="Create, read, update, and delete caption examples."
    />
  )
}
