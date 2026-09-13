import { Router, Route, Switch } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'

import { Layout } from '@/components/Layout'
import { PwaUpdater } from '@/components/PwaUpdater'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { AccountsView } from '@/components/accounts/AccountsView'
import { AccountDetailView } from '@/components/accounts/AccountDetailView'
import { MovementsView } from '@/components/movements/MovementsView'
import { CategoriesView } from '@/components/categories/CategoriesView'
import { ToolsView } from '@/components/tools/ToolsView'
import { NotFound } from '@/components/NotFound'

function App() {
  return (
    <Router hook={useHashLocation}>
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/accounts" component={AccountsView} />
          <Route path="/accounts/:id" component={AccountDetailView} />
          <Route path="/movements" component={MovementsView} />
          <Route path="/categories" component={CategoriesView} />
          <Route path="/tools" component={ToolsView} />
          <Route path="*" component={NotFound} />
        </Switch>
      </Layout>
      <PwaUpdater />
    </Router>
  )
}

export default App