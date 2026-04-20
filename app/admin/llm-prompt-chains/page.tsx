import ResourceDataPage from '@/app/admin/_components/ResourceDataPage'

export default function LlmPromptChainsPage() {
  return (
    <ResourceDataPage
      title="LLM Prompt Chains"
      table="llm_prompt_chains"
      mode="read"
      description="Read-only list of LLM prompt chains."
    />
  )
}
