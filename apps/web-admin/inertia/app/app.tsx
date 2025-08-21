/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { createInertiaApp } from '@inertiajs/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { hydrateRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { query } from '~/components/layout/admin-layout'
import '../css/_keyframe-animations.scss'
import '../css/_variables.scss'
import '../css/app.css'
import '../css/tiptap.scss'

const appName = import.meta.env.VITE_APP_NAME || 'AdonisJS'

createInertiaApp({
  progress: { color: '#5468FF' },

  title: (title) => `${title} - ${appName}`,

  resolve: (name) => {
    return resolvePageComponent(`../pages/${name}.tsx`, import.meta.glob('../pages/**/*.tsx'))
  },

  setup({ el, App, props }) {
    hydrateRoot(
      el,
      <>
        <QueryClientProvider client={query}>
          <App {...props} />,
          <Toaster position="top-right" />
        </QueryClientProvider>
      </>
    )
  },
})
