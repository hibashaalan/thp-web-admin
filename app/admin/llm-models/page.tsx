import ResourceDataPage from '@/app/admin/_components/ResourceDataPage'

export default function LlmModelsPage() {
  return (
    <ResourceDataPage
      title="LLM Models"
      table="llm_models"
      mode="crud"
      description="Create, read, update, and delete LLM models."
    />
  )
}
