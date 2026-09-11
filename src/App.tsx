import { useState } from 'react'

import type { View } from '@/types'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { AccountsView } from '@/components/accounts/AccountsView'
import { MovementsView } from '@/components/movements/MovementsView'
import { CategoriesView } from '@/components/categories/CategoriesView'
import { ToolsView } from '@/components/tools/ToolsView'

function App() {
  const [view, setView] = useState<View>('dashboard')

  return (
    <Layout view={view} onChangeView={setView}>
      {view === 'dashboard' && <Dashboard />}
      {view === 'accounts' && <AccountsView />}
      {view === 'movements' && <MovementsView />}
      {view === 'categories' && <CategoriesView />}
      {view === 'tools' && <ToolsView />}
    </Layout>
  )
}

export default App