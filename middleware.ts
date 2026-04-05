if (path.startsWith('/admin')) {
  if (!user) redirect to /login

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) redirect to /not-authorized
}