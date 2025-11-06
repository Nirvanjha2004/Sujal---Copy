import * as React from "react"
import { Icon } from "@iconify/react"
import { Button } from "./button"
import { Input } from "./input"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import { cn } from "@/shared/lib/utils"
import { useKeyboardShortcuts, formatShortcut } from "@/shared/hooks/useKeyboardShortcuts"

// Command Palette for quick actions
interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  commands: Command[]
  placeholder?: string
}

interface Command {
  id: string
  label: string
  description?: string
  icon?: string
  shortcut?: string
  category?: string
  action: () => void
  disabled?: boolean
}

export function CommandPalette({
  isOpen,
  onClose,
  commands,
  placeholder = "Type a command or search..."
}: CommandPaletteProps) {
  const [search, setSearch] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Filter commands based on search
  const filteredCommands = React.useMemo(() => {
    if (!search) return commands
    
    return commands.filter(command =>
      command.label.toLowerCase().includes(search.toLowerCase()) ||
      command.description?.toLowerCase().includes(search.toLowerCase()) ||
      command.category?.toLowerCase().includes(search.toLowerCase())
    )
  }, [commands, search])

  // Group commands by category
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, Command[]> = {}
    
    filteredCommands.forEach(command => {
      const category = command.category || 'General'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(command)
    })
    
    return groups
  }, [filteredCommands])

  // Handle keyboard navigation
  useKeyboardShortcuts([
    {
      key: 'ArrowDown',
      action: () => setSelectedIndex(prev => 
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      ),
      disabled: !isOpen
    },
    {
      key: 'ArrowUp',
      action: () => setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      ),
      disabled: !isOpen
    },
    {
      key: 'Enter',
      action: () => {
        const command = filteredCommands[selectedIndex]
        if (command && !command.disabled) {
          command.action()
          onClose()
        }
      },
      disabled: !isOpen
    },
    {
      key: 'Escape',
      action: onClose,
      disabled: !isOpen
    }
  ])

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset state when closed
  React.useEffect(() => {
    if (!isOpen) {
      setSearch("")
      setSelectedIndex(0)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed top-[20%] left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4">
        <Card className="shadow-2xl border-2">
          <CardHeader className="pb-3">
            <div className="relative">
              <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="pl-10 text-base border-0 focus:ring-0 shadow-none"
              />
            </div>
          </CardHeader>
          
          <CardContent className="max-h-96 overflow-y-auto p-0">
            {Object.keys(groupedCommands).length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Icon icon="solar:magnifer-bold" className="size-12 mx-auto mb-4 opacity-50" />
                <p>No commands found</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                  <div key={category}>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {category}
                    </div>
                    {categoryCommands.map((command, index) => {
                      const globalIndex = filteredCommands.indexOf(command)
                      const isSelected = globalIndex === selectedIndex
                      
                      return (
                        <button
                          key={command.id}
                          onClick={() => {
                            if (!command.disabled) {
                              command.action()
                              onClose()
                            }
                          }}
                          disabled={command.disabled}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                            isSelected && "bg-accent text-accent-foreground",
                            command.disabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {command.icon && (
                            <Icon icon={command.icon} className="size-4 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{command.label}</div>
                            {command.description && (
                              <div className="text-xs text-muted-foreground truncate">
                                {command.description}
                              </div>
                            )}
                          </div>
                          {command.shortcut && (
                            <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                              {command.shortcut}
                            </kbd>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Context Menu for right-click actions
interface ContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  onClose: () => void
  items: ContextMenuItem[]
}

interface ContextMenuItem {
  id: string
  label: string
  icon?: string
  shortcut?: string
  action: () => void
  disabled?: boolean
  separator?: boolean
  danger?: boolean
}

export function ContextMenu({
  isOpen,
  position,
  onClose,
  items
}: ContextMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null)

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Close on escape
  useKeyboardShortcuts([
    {
      key: 'Escape',
      action: onClose,
      disabled: !isOpen
    }
  ])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-48 bg-popover border border-border rounded-lg shadow-lg py-1"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {item.separator ? (
            <div className="h-px bg-border my-1" />
          ) : (
            <button
              onClick={() => {
                if (!item.disabled) {
                  item.action()
                  onClose()
                }
              }}
              disabled={item.disabled}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                item.disabled && "opacity-50 cursor-not-allowed",
                item.danger && "text-destructive hover:bg-destructive hover:text-destructive-foreground"
              )}
            >
              {item.icon && (
                <Icon icon={item.icon} className="size-4 flex-shrink-0" />
              )}
              <span className="flex-1">{item.label}</span>
              {item.shortcut && (
                <kbd className="text-xs text-muted-foreground">
                  {item.shortcut}
                </kbd>
              )}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// Tooltip with keyboard shortcut
interface TooltipWithShortcutProps {
  children: React.ReactNode
  content: string
  shortcut?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function TooltipWithShortcut({
  children,
  content,
  shortcut,
  side = 'top',
  className
}: TooltipWithShortcutProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const triggerRef = React.useRef<HTMLDivElement>(null)

  const handleMouseEnter = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    
    let x = rect.left + rect.width / 2
    let y = rect.top
    
    switch (side) {
      case 'bottom':
        y = rect.bottom + 8
        break
      case 'top':
        y = rect.top - 8
        break
      case 'left':
        x = rect.left - 8
        y = rect.top + rect.height / 2
        break
      case 'right':
        x = rect.right + 8
        y = rect.top + rect.height / 2
        break
    }
    
    setPosition({ x, y })
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className={cn(
            "fixed z-50 px-3 py-2 text-sm bg-popover text-popover-foreground border border-border rounded-lg shadow-lg pointer-events-none",
            "animate-in fade-in-0 zoom-in-95",
            className
          )}
          style={{
            left: position.x,
            top: position.y,
            transform: side === 'top' || side === 'bottom' 
              ? 'translateX(-50%)' 
              : side === 'left' 
                ? 'translateX(-100%) translateY(-50%)'
                : 'translateY(-50%)'
          }}
        >
          <div className="flex items-center gap-2">
            <span>{content}</span>
            {shortcut && (
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">
                {shortcut}
              </kbd>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// Quick Actions Panel
interface QuickActionsPanelProps {
  actions: QuickAction[]
  className?: string
}

interface QuickAction {
  id: string
  label: string
  icon: string
  shortcut?: string
  action: () => void
  disabled?: boolean
  badge?: string | number
}

export function QuickActionsPanel({
  actions,
  className
}: QuickActionsPanelProps) {
  return (
    <Card className={cn("p-4", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-0">
        {actions.map((action) => (
          <TooltipWithShortcut
            key={action.id}
            content={action.label}
            shortcut={action.shortcut}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={action.action}
              disabled={action.disabled}
              className="w-full justify-start h-auto p-3 relative"
            >
              <Icon icon={action.icon} className="size-4 mr-3" />
              <span className="flex-1 text-left">{action.label}</span>
              {action.badge && (
                <Badge variant="secondary" className="ml-2">
                  {action.badge}
                </Badge>
              )}
              {action.shortcut && (
                <kbd className="ml-2 px-1.5 py-0.5 text-xs font-mono bg-muted rounded border opacity-60">
                  {action.shortcut}
                </kbd>
              )}
            </Button>
          </TooltipWithShortcut>
        ))}
      </CardContent>
    </Card>
  )
}

// Resizable Panels
interface ResizablePanelsProps {
  children: [React.ReactNode, React.ReactNode]
  defaultSizes?: [number, number]
  minSizes?: [number, number]
  direction?: 'horizontal' | 'vertical'
  className?: string
}

export function ResizablePanels({
  children,
  defaultSizes = [50, 50],
  minSizes = [20, 20],
  direction = 'horizontal',
  className
}: ResizablePanelsProps) {
  const [sizes, setSizes] = React.useState(defaultSizes)
  const [isDragging, setIsDragging] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseMove = React.useCallback((event: MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const total = direction === 'horizontal' ? rect.width : rect.height
    const position = direction === 'horizontal' 
      ? event.clientX - rect.left 
      : event.clientY - rect.top

    const percentage = (position / total) * 100
    const clampedPercentage = Math.max(minSizes[0], Math.min(100 - minSizes[1], percentage))

    setSizes([clampedPercentage, 100 - clampedPercentage])
  }, [isDragging, direction, minSizes])

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false)
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex",
        direction === 'horizontal' ? 'flex-row' : 'flex-col',
        className
      )}
    >
      <div
        style={{
          [direction === 'horizontal' ? 'width' : 'height']: `${sizes[0]}%`
        }}
        className="overflow-hidden"
      >
        {children[0]}
      </div>
      
      <div
        className={cn(
          "bg-border cursor-col-resize hover:bg-primary/20 transition-colors",
          direction === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'
        )}
        onMouseDown={handleMouseDown}
      />
      
      <div
        style={{
          [direction === 'horizontal' ? 'width' : 'height']: `${sizes[1]}%`
        }}
        className="overflow-hidden"
      >
        {children[1]}
      </div>
    </div>
  )
}

// Example usage
export function DesktopFeaturesDemo() {
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false)
  const [contextMenu, setContextMenu] = React.useState<{
    isOpen: boolean
    position: { x: number; y: number }
  }>({ isOpen: false, position: { x: 0, y: 0 } })

  const commands: Command[] = [
    {
      id: 'new-property',
      label: 'New Property',
      description: 'Create a new property listing',
      icon: 'solar:home-add-bold',
      shortcut: 'Ctrl+N',
      category: 'Actions',
      action: () => console.log('New property')
    },
    {
      id: 'search',
      label: 'Search Properties',
      description: 'Search through all properties',
      icon: 'solar:magnifer-bold',
      shortcut: '/',
      category: 'Navigation',
      action: () => console.log('Search')
    }
  ]

  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'edit',
      label: 'Edit',
      icon: 'solar:pen-bold',
      shortcut: 'Ctrl+E',
      action: () => console.log('Edit')
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'solar:trash-bin-trash-bold',
      shortcut: 'Del',
      danger: true,
      action: () => console.log('Delete')
    }
  ]

  const quickActions: QuickAction[] = [
    {
      id: 'new',
      label: 'New Property',
      icon: 'solar:home-add-bold',
      shortcut: 'Ctrl+N',
      action: () => console.log('New property')
    },
    {
      id: 'search',
      label: 'Search',
      icon: 'solar:magnifer-bold',
      shortcut: '/',
      action: () => console.log('Search')
    }
  ]

  // Open command palette with Ctrl+K
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      action: () => setCommandPaletteOpen(true)
    }
  ])

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Desktop Features Demo</h2>
        
        <div className="flex gap-4">
          <Button onClick={() => setCommandPaletteOpen(true)}>
            Open Command Palette (Ctrl+K)
          </Button>
          
          <div
            onContextMenu={(e) => {
              e.preventDefault()
              setContextMenu({
                isOpen: true,
                position: { x: e.clientX, y: e.clientY }
              })
            }}
            className="p-4 border border-dashed border-muted-foreground rounded-lg cursor-pointer"
          >
            Right-click for context menu
          </div>
        </div>
      </div>

      <QuickActionsPanel actions={quickActions} className="max-w-sm" />

      <ResizablePanels>
        <div className="p-4 bg-muted/30 h-64">
          <h3 className="font-semibold mb-2">Left Panel</h3>
          <p className="text-sm text-muted-foreground">
            This panel can be resized by dragging the divider.
          </p>
        </div>
        <div className="p-4 bg-accent/30 h-64">
          <h3 className="font-semibold mb-2">Right Panel</h3>
          <p className="text-sm text-muted-foreground">
            Resize functionality works on desktop devices.
          </p>
        </div>
      </ResizablePanels>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commands}
      />

      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        items={contextMenuItems}
      />
    </div>
  )
}