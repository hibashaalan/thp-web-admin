import ResourceDataPage from '@/app/admin/_components/ResourceDataPage'

export default function CaptionRequestsPage() {
  return (
    <ResourceDataPage
      title="Caption Requests"
      table="caption_requests"
      mode="read"
      description="Read-only list of caption requests."
    />
  )
}
