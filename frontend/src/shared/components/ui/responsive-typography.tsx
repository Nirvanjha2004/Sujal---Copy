import * as React from "react"
import { cn } from "@/shared/lib/utils"

interface ResponsiveTextProps {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'default' | 'muted' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  align?: 'left' | 'center' | 'right' | 'justify'
  responsive?: boolean
  className?: string
}

export function ResponsiveText({
  children,
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  color = 'default',
  align = 'left',
  responsive = true,
  className
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: responsive ? 'text-xs md:text-sm' : 'text-xs',
    sm: responsive ? 'text-sm md:text-base' : 'text-sm',
    base: responsive ? 'text-base md:text-lg' : 'text-base',
    lg: responsive ? 'text-lg md:text-xl' : 'text-lg',
    xl: responsive ? 'text-xl md:text-2xl' : 'text-xl',
    '2xl': responsive ? 'text-2xl md:text-3xl' : 'text-2xl',
    '3xl': responsive ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-3xl',
    '4xl': responsive ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-4xl',
    '5xl': responsive ? 'text-5xl md:text-6xl lg:text-7xl' : 'text-5xl',
    '6xl': responsive ? 'text-6xl md:text-7xl lg:text-8xl' : 'text-6xl',
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }

  const colorClasses = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary-foreground',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  }

  return (
    <Component
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        colorClasses[color],
        alignClasses[align],
        responsive && 'leading-relaxed md:leading-normal',
        className
      )}
    >
      {children}
    </Component>
  )
}

// Fluid Typography Component with CSS clamp
interface FluidTextProps {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  minSize: string
  maxSize: string
  minViewport?: string
  maxViewport?: string
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'default' | 'muted' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  className?: string
}

export function FluidText({
  children,
  as: Component = 'p',
  minSize,
  maxSize,
  minViewport = '320px',
  maxViewport = '1200px',
  weight = 'normal',
  color = 'default',
  className
}: FluidTextProps) {
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }

  const colorClasses = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary-foreground',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
  }

  const fluidStyle = {
    fontSize: `clamp(${minSize}, ${minSize} + (${maxSize} - ${minSize}) * ((100vw - ${minViewport}) / (${maxViewport} - ${minViewport})), ${maxSize})`
  }

  return (
    <Component
      className={cn(
        weightClasses[weight],
        colorClasses[color],
        'leading-relaxed',
        className
      )}
      style={fluidStyle}
    >
      {children}
    </Component>
  )
}

// Responsive Heading Component
interface ResponsiveHeadingProps {
  children: React.ReactNode
  level: 1 | 2 | 3 | 4 | 5 | 6
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  weight?: 'medium' | 'semibold' | 'bold'
  color?: 'default' | 'muted' | 'primary'
  spacing?: 'tight' | 'normal' | 'loose'
  className?: string
}

export function ResponsiveHeading({
  children,
  level,
  size,
  weight = 'semibold',
  color = 'default',
  spacing = 'normal',
  className
}: ResponsiveHeadingProps) {
  const Component = `h${level}` as keyof JSX.IntrinsicElements

  // Default sizes based on heading level if not specified
  const defaultSizes = {
    1: '2xl',
    2: 'xl',
    3: 'lg',
    4: 'md',
    5: 'sm',
    6: 'sm',
  } as const

  const actualSize = size || defaultSizes[level]

  const sizeClasses = {
    sm: 'text-lg md:text-xl lg:text-2xl',
    md: 'text-xl md:text-2xl lg:text-3xl',
    lg: 'text-2xl md:text-3xl lg:text-4xl',
    xl: 'text-3xl md:text-4xl lg:text-5xl',
    '2xl': 'text-4xl md:text-5xl lg:text-6xl xl:text-7xl',
  }

  const weightClasses = {
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }

  const colorClasses = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    primary: 'text-primary',
  }

  const spacingClasses = {
    tight: 'leading-tight',
    normal: 'leading-normal',
    loose: 'leading-relaxed',
  }

  return (
    <Component
      className={cn(
        sizeClasses[actualSize],
        weightClasses[weight],
        colorClasses[color],
        spacingClasses[spacing],
        'font-heading tracking-tight',
        className
      )}
    >
      {children}
    </Component>
  )
}

// Responsive Paragraph Component
interface ResponsiveParagraphProps {
  children: React.ReactNode
  size?: 'sm' | 'base' | 'lg'
  color?: 'default' | 'muted'
  spacing?: 'tight' | 'normal' | 'loose'
  maxWidth?: string
  className?: string
}

export function ResponsiveParagraph({
  children,
  size = 'base',
  color = 'default',
  spacing = 'normal',
  maxWidth,
  className
}: ResponsiveParagraphProps) {
  const sizeClasses = {
    sm: 'text-sm md:text-base',
    base: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl',
  }

  const colorClasses = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
  }

  const spacingClasses = {
    tight: 'leading-snug',
    normal: 'leading-relaxed',
    loose: 'leading-loose',
  }

  const style = maxWidth ? { maxWidth } : undefined

  return (
    <p
      className={cn(
        sizeClasses[size],
        colorClasses[color],
        spacingClasses[spacing],
        'font-body',
        className
      )}
      style={style}
    >
      {children}
    </p>
  )
}

// Text with responsive line clamping
interface ClampedTextProps {
  children: React.ReactNode
  lines: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  className?: string
}

export function ClampedText({
  children,
  lines,
  className
}: ClampedTextProps) {
  const clampStyle = {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    WebkitLineClamp: lines.mobile || 3,
    '--clamp-lines-tablet': lines.tablet,
    '--clamp-lines-desktop': lines.desktop,
  } as React.CSSProperties

  return (
    <div
      className={cn('clamped-text', className)}
      style={clampStyle}
    >
      {children}
    </div>
  )
}

// Responsive text with truncation
interface TruncatedTextProps {
  children: React.ReactNode
  maxLength: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  className?: string
}

export function TruncatedText({
  children,
  maxLength,
  className
}: TruncatedTextProps) {
  const [screenSize, setScreenSize] = React.useState<'mobile' | 'tablet' | 'desktop'>('mobile')

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width >= 1024) {
        setScreenSize('desktop')
      } else if (width >= 768) {
        setScreenSize('tablet')
      } else {
        setScreenSize('mobile')
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  const currentMaxLength = maxLength[screenSize] || maxLength.mobile || 100
  const text = typeof children === 'string' ? children : String(children)
  const truncated = text.length > currentMaxLength 
    ? `${text.substring(0, currentMaxLength)}...` 
    : text

  return (
    <span className={className} title={text}>
      {truncated}
    </span>
  )
}

// Example usage components
export function TypographyShowcase() {
  return (
    <div className="space-y-8 p-8">
      <div className="space-y-4">
        <ResponsiveHeading level={1} size="2xl">
          Responsive Heading H1
        </ResponsiveHeading>
        <ResponsiveHeading level={2} size="xl">
          Responsive Heading H2
        </ResponsiveHeading>
        <ResponsiveHeading level={3} size="lg">
          Responsive Heading H3
        </ResponsiveHeading>
      </div>

      <div className="space-y-4">
        <FluidText
          as="h2"
          minSize="1.5rem"
          maxSize="3rem"
          weight="bold"
          color="primary"
        >
          Fluid Typography Example
        </FluidText>
        
        <ResponsiveParagraph size="lg" maxWidth="65ch">
          This is a responsive paragraph that scales beautifully across different screen sizes. 
          The text size and line height adjust automatically to provide optimal readability 
          on mobile, tablet, and desktop devices.
        </ResponsiveParagraph>
      </div>

      <div className="space-y-4">
        <ResponsiveText size="xl" weight="semibold">
          Responsive Text Component
        </ResponsiveText>
        
        <ClampedText lines={{ mobile: 2, tablet: 3, desktop: 4 }}>
          This text will be clamped to different numbers of lines based on the screen size. 
          On mobile it shows 2 lines, on tablet 3 lines, and on desktop 4 lines. 
          This is useful for maintaining consistent layouts while showing appropriate 
          amounts of content for each device type.
        </ClampedText>
      </div>

      <div className="space-y-4">
        <TruncatedText maxLength={{ mobile: 50, tablet: 100, desktop: 150 }}>
          This is a long text that will be truncated at different lengths based on screen size. 
          Mobile devices will see a shorter version while desktop users get more content.
        </TruncatedText>
      </div>
    </div>
  )
}