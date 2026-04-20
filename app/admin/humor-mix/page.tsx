import ResourceDataPage from '@/app/admin/_components/ResourceDataPage'

export default function HumorMixPage() {
  return (
    <ResourceDataPage
      title="Humor Mix"
      table="humor_flavor_mix"
      tableCandidates={['humor_mix']}
      mode="single-update"
      description="Read and update the first configuration row in humor_flavor_mix."
    />
  )
}
