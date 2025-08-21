import { createInertiaApp } from '@inertiajs/react'
import { QueryClientProvider } from '@tanstack/react-query'
import ReactDOMServer from 'react-dom/server'
import { Toaster } from 'react-hot-toast'
import { query } from '~/components/layout/admin-layout'

export default function render(page: any) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const pages = import.meta.glob('../pages/**/*.tsx', { eager: true })
      return pages[`../pages/${name}.tsx`]
    },
    setup: ({ App, props }) => (
      <>
        <QueryClientProvider client={query}>
          <App {...props} />,
          <Toaster position="top-right" />
        </QueryClientProvider>
      </>
    ),
  })
}
