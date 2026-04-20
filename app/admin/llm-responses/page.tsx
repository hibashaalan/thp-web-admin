import ResourceDataPage from '@/app/admin/_components/ResourceDataPage'

export default function LlmResponsesPage() {
  return (
    <ResourceDataPage
      title="LLM Responses"
      table="llm_responses"
      mode="read"
      description="Read-only list of captured LLM responses."
    />
  )
}
