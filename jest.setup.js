import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    toString: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  notFound: jest.fn(),
  redirect: jest.fn(),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

// Mock date-fns locale
jest.mock('date-fns/locale', () => ({
  ko: {},
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2일 전'),
}))

// Mock pagination component
jest.mock('@/components/pagination', () => ({
  Pagination: ({ currentPage, totalPages }) => (
    <div data-testid="pagination">
      Pagination: {currentPage} of {totalPages}
    </div>
  ),
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children }) => <div data-testid="sign-in-button">{children}</div>,
  UserButton: () => <div data-testid="user-button" />,
  useUser: jest.fn(() => ({
    isLoaded: true,
    user: null,
    isSignedIn: false,
  })),
  useAuth: jest.fn(() => ({
    isLoaded: true,
    userId: null,
    sessionId: null,
    isSignedIn: false,
  })),
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({
    userId: null,
    user: null,
  })),
}))

// Mock browser APIs
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(() => Promise.resolve()),
  },
})

Object.defineProperty(window, 'history', {
  value: {
    pushState: jest.fn(),
    replaceState: jest.fn(),
  },
})

// Mock window.confirm and window.alert
Object.defineProperty(window, 'confirm', {
  value: jest.fn(() => true),
})

Object.defineProperty(window, 'alert', {
  value: jest.fn(),
})

// Mock addEventListener for beforeunload and popstate
const originalAddEventListener = window.addEventListener
const originalRemoveEventListener = window.removeEventListener

window.addEventListener = jest.fn((event, handler) => {
  if (event === 'beforeunload' || event === 'popstate') {
    return
  }
  return originalAddEventListener.call(window, event, handler)
})

window.removeEventListener = jest.fn((event, handler) => {
  if (event === 'beforeunload' || event === 'popstate') {
    return
  }
  return originalRemoveEventListener.call(window, event, handler)
})

// Mock database and server actions
jest.mock('@/db/queries', () => ({
  getAgents: jest.fn(),
  getAgentById: jest.fn(),
  createAgent: jest.fn(),
  updateAgent: jest.fn(),
  deleteAgent: jest.fn(),
  incrementViewCount: jest.fn(),
  incrementCopyCount: jest.fn(),
  getAgentsByCategory: jest.fn(),
  searchAgents: jest.fn(),
  getCategoryStats: jest.fn(),
}))

jest.mock('@/lib/actions', () => ({
  getAgentsAction: jest.fn(),
  getAgentByIdAction: jest.fn(),
  createAgentAction: jest.fn(),
  updateAgentAction: jest.fn(),
  deleteAgentAction: jest.fn(),
  incrementViewCountAction: jest.fn(),
  incrementCopyCountAction: jest.fn(),
  getAgentsByCategoryAction: jest.fn(),
  searchAgentsAction: jest.fn(),
  getCategoryStatsAction: jest.fn(),
}))

// Mock revalidatePath and redirect
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

// Suppress console errors in tests unless needed
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}