import ResourceDataPage from '@/app/admin/_components/ResourceDataPage'

export default function LlmProvidersPage() {
  return (
    <ResourceDataPage
      title="LLM Providers"
      table="llm_providers"
      mode="crud"
      description="Create, read, update, and delete LLM providers."
    />
  )
}
