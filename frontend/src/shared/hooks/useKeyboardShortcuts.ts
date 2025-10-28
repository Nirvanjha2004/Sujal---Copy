import { useEffect, useCallback, useRef } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: () => void
  description?: string
  preventDefault?: boolean
  stopPropagation?: boolean
  disabled?: boolean
}

interface UseKeyboardShortcutsOptions {
  enableOnFormElements?: boolean
  global?: boolean
  target?: HTMLElement | null
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const {
    enableOnFormElements = false,
    global = true,
    target = null
  } = options

  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if shortcuts are disabled on form elements and we're in one
    if (!enableOnFormElements) {
      const target = event.target as HTMLElement
      const tagName = target.tagName.toLowerCase()
      const isFormElement = ['input', 'textarea', 'select'].includes(tagName)
      const isContentEditable = target.contentEditable === 'true'
      
      if (isFormElement || isContentEditable) {
        return
      }
    }

    // Find matching shortcut
    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      if (shortcut.disabled) return false
      
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase()
      const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey
      const altMatch = !!shortcut.altKey === event.altKey
      const shiftMatch = !!shortcut.shiftKey === event.shiftKey
      const metaMatch = !!shortcut.metaKey === event.metaKey

      return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch
    })

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault()
      }
      if (matchingShortcut.stopPropagation) {
        event.stopPropagation()
      }
      matchingShortcut.action()
    }
  }, [enableOnFormElements])

  useEffect(() => {
    const element = target || (global ? document : null)
    
    if (element) {
      element.addEventListener('keydown', handleKeyDown)
      return () => element.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, target, global])

  return {
    shortcuts: shortcutsRef.current
  }
}

// Hook for common dashboard shortcuts
export function useDashboardShortcuts(callbacks: {
  onSearch?: () => void
  onNewItem?: () => void
  onRefresh?: () => void
  onSettings?: () => void
  onHelp?: () => void
  onLogout?: () => void
  onToggleSidebar?: () => void
  onGoHome?: () => void
  onGoBack?: () => void
  onGoForward?: () => void
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: '/',
      action: callbacks.onSearch || (() => {}),
      description: 'Focus search',
      disabled: !callbacks.onSearch
    },
    {
      key: 'n',
      ctrlKey: true,
      action: callbacks.onNewItem || (() => {}),
      description: 'Create new item',
      disabled: !callbacks.onNewItem
    },
    {
      key: 'r',
      ctrlKey: true,
      action: callbacks.onRefresh || (() => {}),
      description: 'Refresh page',
      disabled: !callbacks.onRefresh
    },
    {
      key: ',',
      ctrlKey: true,
      action: callbacks.onSettings || (() => {}),
      description: 'Open settings',
      disabled: !callbacks.onSettings
    },
    {
      key: '?',
      shiftKey: true,
      action: callbacks.onHelp || (() => {}),
      description: 'Show help',
      disabled: !callbacks.onHelp
    },
    {
      key: 'q',
      ctrlKey: true,
      shiftKey: true,
      action: callbacks.onLogout || (() => {}),
      description: 'Logout',
      disabled: !callbacks.onLogout
    },
    {
      key: 'b',
      ctrlKey: true,
      action: callbacks.onToggleSidebar || (() => {}),
      description: 'Toggle sidebar',
      disabled: !callbacks.onToggleSidebar
    },
    {
      key: 'h',
      ctrlKey: true,
      action: callbacks.onGoHome || (() => {}),
      description: 'Go to home',
      disabled: !callbacks.onGoHome
    },
    {
      key: 'ArrowLeft',
      altKey: true,
      action: callbacks.onGoBack || (() => {}),
      description: 'Go back',
      disabled: !callbacks.onGoBack
    },
    {
      key: 'ArrowRight',
      altKey: true,
      action: callbacks.onGoForward || (() => {}),
      description: 'Go forward',
      disabled: !callbacks.onGoForward
    }
  ]

  return useKeyboardShortcuts(shortcuts)
}

// Hook for form shortcuts
export function useFormShortcuts(callbacks: {
  onSave?: () => void
  onCancel?: () => void
  onReset?: () => void
  onSubmit?: () => void
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 's',
      ctrlKey: true,
      action: callbacks.onSave || (() => {}),
      description: 'Save form',
      disabled: !callbacks.onSave
    },
    {
      key: 'Escape',
      action: callbacks.onCancel || (() => {}),
      description: 'Cancel',
      disabled: !callbacks.onCancel
    },
    {
      key: 'r',
      ctrlKey: true,
      shiftKey: true,
      action: callbacks.onReset || (() => {}),
      description: 'Reset form',
      disabled: !callbacks.onReset
    },
    {
      key: 'Enter',
      ctrlKey: true,
      action: callbacks.onSubmit || (() => {}),
      description: 'Submit form',
      disabled: !callbacks.onSubmit
    }
  ]

  return useKeyboardShortcuts(shortcuts, { enableOnFormElements: true })
}

// Hook for table/list shortcuts
export function useTableShortcuts(callbacks: {
  onSelectAll?: () => void
  onDeselectAll?: () => void
  onDelete?: () => void
  onEdit?: () => void
  onView?: () => void
  onExport?: () => void
  onFilter?: () => void
  onSort?: () => void
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'a',
      ctrlKey: true,
      action: callbacks.onSelectAll || (() => {}),
      description: 'Select all',
      disabled: !callbacks.onSelectAll
    },
    {
      key: 'd',
      ctrlKey: true,
      action: callbacks.onDeselectAll || (() => {}),
      description: 'Deselect all',
      disabled: !callbacks.onDeselectAll
    },
    {
      key: 'Delete',
      action: callbacks.onDelete || (() => {}),
      description: 'Delete selected',
      disabled: !callbacks.onDelete
    },
    {
      key: 'e',
      ctrlKey: true,
      action: callbacks.onEdit || (() => {}),
      description: 'Edit selected',
      disabled: !callbacks.onEdit
    },
    {
      key: 'Enter',
      action: callbacks.onView || (() => {}),
      description: 'View selected',
      disabled: !callbacks.onView
    },
    {
      key: 'e',
      ctrlKey: true,
      shiftKey: true,
      action: callbacks.onExport || (() => {}),
      description: 'Export data',
      disabled: !callbacks.onExport
    },
    {
      key: 'f',
      ctrlKey: true,
      action: callbacks.onFilter || (() => {}),
      description: 'Focus filter',
      disabled: !callbacks.onFilter
    },
    {
      key: 's',
      ctrlKey: true,
      shiftKey: true,
      action: callbacks.onSort || (() => {}),
      description: 'Sort options',
      disabled: !callbacks.onSort
    }
  ]

  return useKeyboardShortcuts(shortcuts)
}

// Utility function to format shortcut display
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = []
  
  if (shortcut.ctrlKey) parts.push('Ctrl')
  if (shortcut.altKey) parts.push('Alt')
  if (shortcut.shiftKey) parts.push('Shift')
  if (shortcut.metaKey) parts.push('Cmd')
  
  // Format special keys
  const keyMap: Record<string, string> = {
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Enter': '↵',
    'Escape': 'Esc',
    'Delete': 'Del',
    ' ': 'Space'
  }
  
  const displayKey = keyMap[shortcut.key] || shortcut.key.toUpperCase()
  parts.push(displayKey)
  
  return parts.join(' + ')
}

// Component to display keyboard shortcuts help
export function KeyboardShortcutsHelp({ shortcuts }: { shortcuts: KeyboardShortcut[] }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        Keyboard Shortcuts
      </h3>
      <div className="space-y-1">
        {shortcuts
          .filter(shortcut => !shortcut.disabled && shortcut.description)
          .map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                {formatShortcut(shortcut)}
              </kbd>
            </div>
          ))}
      </div>
    </div>
  )
}