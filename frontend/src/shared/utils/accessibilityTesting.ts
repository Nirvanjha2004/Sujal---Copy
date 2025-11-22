/**
 * Accessibility testing utilities for development and QA
 */

import { getContrastRatio, meetsWCAGAA, meetsWCAGAAA } from './accessibility';

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  element?: HTMLElement;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
}

export interface AccessibilityReport {
  issues: AccessibilityIssue[];
  summary: {
    total: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  score: number; // 0-100
}

/**
 * Run accessibility audit on a container element
 */
export function auditAccessibility(container: HTMLElement = document.body): AccessibilityReport {
  const issues: AccessibilityIssue[] = [];

  // Check for missing alt text on images
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt && !img.getAttribute('aria-label') && !img.getAttribute('aria-labelledby')) {
      issues.push({
        type: 'error',
        rule: 'img-alt',
        message: 'Image missing alternative text',
        element: img,
        severity: 'serious'
      });
    }
  });

  // Check for missing form labels
  const inputs = container.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const hasLabel = 
      input.getAttribute('aria-label') ||
      input.getAttribute('aria-labelledby') ||
      container.querySelector(`label[for="${input.id}"]`) ||
      input.closest('label');

    if (!hasLabel) {
      issues.push({
        type: 'error',
        rule: 'label',
        message: 'Form control missing accessible label',
        element: input as HTMLElement,
        severity: 'critical'
      });
    }
  });

  // Check for missing headings hierarchy
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let previousLevel = 0;
  
  headings.forEach(heading => {
    const currentLevel = parseInt(heading.tagName.charAt(1));
    
    if (currentLevel > previousLevel + 1) {
      issues.push({
        type: 'warning',
        rule: 'heading-order',
        message: `Heading level skipped from h${previousLevel} to h${currentLevel}`,
        element: heading as HTMLElement,
        severity: 'moderate'
      });
    }
    
    previousLevel = currentLevel;
  });

  // Check for missing focus indicators
  const focusableElements = container.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  focusableElements.forEach(element => {
    const styles = window.getComputedStyle(element, ':focus');
    const hasOutline = styles.outline !== 'none' && styles.outline !== '0px';
    const hasBoxShadow = styles.boxShadow !== 'none';
    
    if (!hasOutline && !hasBoxShadow) {
      issues.push({
        type: 'warning',
        rule: 'focus-visible',
        message: 'Focusable element missing visible focus indicator',
        element: element as HTMLElement,
        severity: 'serious'
      });
    }
  });

  // Check for color contrast issues
  const textElements = container.querySelectorAll('p, span, div, a, button, label, h1, h2, h3, h4, h5, h6');
  
  textElements.forEach(element => {
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
      const fontSize = parseFloat(styles.fontSize);
      const fontWeight = styles.fontWeight;
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
      
      try {
        if (!meetsWCAGAA(color, backgroundColor, isLargeText)) {
          issues.push({
            type: 'error',
            rule: 'color-contrast',
            message: `Insufficient color contrast ratio (WCAG AA)`,
            element: element as HTMLElement,
            severity: 'serious'
          });
        }
      } catch (error) {
        // Skip if color parsing fails
      }
    }
  });

  // Check for missing ARIA labels on interactive elements
  const interactiveElements = container.querySelectorAll('button, [role="button"], a, [role="link"]');
  
  interactiveElements.forEach(element => {
    const hasAccessibleName = 
      element.textContent?.trim() ||
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.querySelector('img')?.alt;

    if (!hasAccessibleName) {
      issues.push({
        type: 'error',
        rule: 'button-name',
        message: 'Interactive element missing accessible name',
        element: element as HTMLElement,
        severity: 'critical'
      });
    }
  });

  // Check for proper table structure
  const tables = container.querySelectorAll('table');
  
  tables.forEach(table => {
    const hasCaption = table.querySelector('caption');
    const hasHeaders = table.querySelectorAll('th').length > 0;
    
    if (!hasCaption && !table.getAttribute('aria-label') && !table.getAttribute('aria-labelledby')) {
      issues.push({
        type: 'warning',
        rule: 'table-caption',
        message: 'Table missing caption or accessible name',
        element: table,
        severity: 'moderate'
      });
    }
    
    if (!hasHeaders) {
      issues.push({
        type: 'error',
        rule: 'table-headers',
        message: 'Table missing header cells',
        element: table,
        severity: 'serious'
      });
    }
  });

  // Check for proper list structure
  const lists = container.querySelectorAll('ul, ol');
  
  lists.forEach(list => {
    const listItems = list.querySelectorAll('li');
    const directChildren = Array.from(list.children);
    const hasInvalidChildren = directChildren.some(child => child.tagName !== 'LI');
    
    if (listItems.length === 0) {
      issues.push({
        type: 'error',
        rule: 'list-structure',
        message: 'List element contains no list items',
        element: list as HTMLElement,
        severity: 'moderate'
      });
    }
    
    if (hasInvalidChildren) {
      issues.push({
        type: 'warning',
        rule: 'list-structure',
        message: 'List contains invalid child elements',
        element: list as HTMLElement,
        severity: 'moderate'
      });
    }
  });

  // Check for keyboard accessibility
  const clickableElements = container.querySelectorAll('[onclick], .cursor-pointer');
  
  clickableElements.forEach(element => {
    const isButton = element.tagName === 'BUTTON' || element.getAttribute('role') === 'button';
    const isLink = element.tagName === 'A' || element.getAttribute('role') === 'link';
    const isFocusable = element.hasAttribute('tabindex') || isButton || isLink;
    
    if (!isFocusable) {
      issues.push({
        type: 'warning',
        rule: 'keyboard-accessible',
        message: 'Clickable element not keyboard accessible',
        element: element as HTMLElement,
        severity: 'serious'
      });
    }
  });

  // Calculate summary
  const summary = {
    total: issues.length,
    critical: issues.filter(i => i.severity === 'critical').length,
    serious: issues.filter(i => i.severity === 'serious').length,
    moderate: issues.filter(i => i.severity === 'moderate').length,
    minor: issues.filter(i => i.severity === 'minor').length
  };

  // Calculate score (0-100)
  const maxPossibleIssues = Math.max(1, textElements.length + inputs.length + images.length);
  const weightedIssues = 
    summary.critical * 4 + 
    summary.serious * 3 + 
    summary.moderate * 2 + 
    summary.minor * 1;
  
  const score = Math.max(0, Math.round(100 - (weightedIssues / maxPossibleIssues) * 100));

  return {
    issues,
    summary,
    score
  };
}

/**
 * Generate accessibility report as HTML
 */
export function generateAccessibilityReport(report: AccessibilityReport): string {
  const { issues, summary, score } = report;
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#22c55e'; // green
    if (score >= 70) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'serious': return '#ea580c';
      case 'moderate': return '#d97706';
      case 'minor': return '#65a30d';
      default: return '#6b7280';
    }
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Accessibility Report</title>
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f9fafb; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .score { font-size: 48px; font-weight: bold; color: ${getScoreColor(score)}; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 24px 0; }
        .summary-item { background: white; padding: 16px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .summary-number { font-size: 24px; font-weight: bold; }
        .issues { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .issue { padding: 16px; border-bottom: 1px solid #e5e7eb; }
        .issue:last-child { border-bottom: none; }
        .issue-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .severity-badge { padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .issue-message { color: #374151; }
        .issue-rule { color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Accessibility Report</h1>
          <div class="score">${score}/100</div>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <div class="summary-number">${summary.total}</div>
            <div>Total Issues</div>
          </div>
          <div class="summary-item">
            <div class="summary-number" style="color: ${getSeverityColor('critical')}">${summary.critical}</div>
            <div>Critical</div>
          </div>
          <div class="summary-item">
            <div class="summary-number" style="color: ${getSeverityColor('serious')}">${summary.serious}</div>
            <div>Serious</div>
          </div>
          <div class="summary-item">
            <div class="summary-number" style="color: ${getSeverityColor('moderate')}">${summary.moderate}</div>
            <div>Moderate</div>
          </div>
          <div class="summary-item">
            <div class="summary-number" style="color: ${getSeverityColor('minor')}">${summary.minor}</div>
            <div>Minor</div>
          </div>
        </div>
        
        <div class="issues">
          <h2 style="padding: 16px; margin: 0; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">Issues Found</h2>
          ${issues.length === 0 
            ? '<div class="issue">🎉 No accessibility issues found!</div>'
            : issues.map(issue => `
              <div class="issue">
                <div class="issue-header">
                  <span class="severity-badge" style="background-color: ${getSeverityColor(issue.severity)}">
                    ${issue.severity}
                  </span>
                  <span class="issue-rule">${issue.rule}</span>
                </div>
                <div class="issue-message">${issue.message}</div>
              </div>
            `).join('')
          }
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Log accessibility issues to console with styling
 */
export function logAccessibilityIssues(report: AccessibilityReport): void {
  const { issues, summary, score } = report;
  
  console.group(`🔍 Accessibility Report (Score: ${score}/100)`);
  
  console.log(`📊 Summary:
    Total Issues: ${summary.total}
    Critical: ${summary.critical}
    Serious: ${summary.serious}
    Moderate: ${summary.moderate}
    Minor: ${summary.minor}
  `);
  
  if (issues.length === 0) {
    console.log('🎉 No accessibility issues found!');
  } else {
    issues.forEach(issue => {
      const emoji = {
        critical: '🚨',
        serious: '⚠️',
        moderate: '⚡',
        minor: 'ℹ️'
      }[issue.severity];
      
      console.groupCollapsed(`${emoji} ${issue.severity.toUpperCase()}: ${issue.message}`);
      console.log(`Rule: ${issue.rule}`);
      if (issue.element) {
        console.log('Element:', issue.element);
      }
      console.groupEnd();
    });
  }
  
  console.groupEnd();
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  
  return !(
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    element.hasAttribute('aria-hidden') ||
    element.offsetParent === null
  );
}

/**
 * Get accessible name for an element
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel.trim();
  
  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) return labelElement.textContent?.trim() || '';
  }
  
  // Check associated label
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent?.trim() || '';
  }
  
  // Check if element is inside a label
  const parentLabel = element.closest('label');
  if (parentLabel) return parentLabel.textContent?.trim() || '';
  
  // Check text content
  const textContent = element.textContent?.trim();
  if (textContent) return textContent;
  
  // Check alt text for images
  if (element.tagName === 'IMG') {
    return (element as HTMLImageElement).alt || '';
  }
  
  // Check title attribute
  const title = element.getAttribute('title');
  if (title) return title.trim();
  
  return '';
}

/**
 * Development helper to highlight accessibility issues
 */
export function highlightAccessibilityIssues(container: HTMLElement = document.body): void {
  const report = auditAccessibility(container);
  
  // Remove existing highlights
  document.querySelectorAll('.accessibility-highlight').forEach(el => {
    el.classList.remove('accessibility-highlight');
    el.removeAttribute('data-accessibility-issue');
  });
  
  // Add highlights for issues
  report.issues.forEach(issue => {
    if (issue.element) {
      issue.element.classList.add('accessibility-highlight');
      issue.element.setAttribute('data-accessibility-issue', issue.message);
      
      const color = {
        critical: '#dc2626',
        serious: '#ea580c',
        moderate: '#d97706',
        minor: '#65a30d'
      }[issue.severity];
      
      issue.element.style.outline = `2px solid ${color}`;
      issue.element.style.outlineOffset = '2px';
    }
  });
  
  // Add CSS for highlights if not already present
  if (!document.getElementById('accessibility-highlight-styles')) {
    const style = document.createElement('style');
    style.id = 'accessibility-highlight-styles';
    style.textContent = `
      .accessibility-highlight {
        position: relative;
      }
      .accessibility-highlight::after {
        content: attr(data-accessibility-issue);
        position: absolute;
        top: 100%;
        left: 0;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 10000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
      }
      .accessibility-highlight:hover::after {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
  
  logAccessibilityIssues(report);
}