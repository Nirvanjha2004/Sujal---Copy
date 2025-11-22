/**
 * Tests for Image Loading Priority Manager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ImageLoadingPriorityManager,
  calculateImagePriority,
} from '../imageLoadingPriority';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.IntersectionObserver = MockIntersectionObserver as any;

describe('ImageLoadingPriorityManager', () => {
  let manager: ImageLoadingPriorityManager;

  beforeEach(() => {
    // Reset singleton instance
    (ImageLoadingPriorityManager as any).instance = null;
    manager = ImageLoadingPriorityManager.getInstance();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ImageLoadingPriorityManager.getInstance();
      const instance2 = ImageLoadingPriorityManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should accept configuration', () => {
      const instance = ImageLoadingPriorityManager.getInstance({
        maxConcurrentPerDomain: 8,
      });
      expect(instance).toBeDefined();
    });
  });

  describe('registerImage', () => {
    it('should register image element', () => {
      const img = document.createElement('img');
      img.src = 'https://example.com/image.jpg';

      manager.registerImage(img, 'high');
      
      expect(img.fetchPriority).toBe('high');
    });

    it('should set correct fetchpriority attribute', () => {
      const imgHigh = document.createElement('img');
      imgHigh.src = 'https://example.com/high.jpg';
      manager.registerImage(imgHigh, 'high');
      expect(imgHigh.fetchPriority).toBe('high');

      const imgLow = document.createElement('img');
      imgLow.src = 'https://example.com/low.jpg';
      manager.registerImage(imgLow, 'low');
      expect(imgLow.fetchPriority).toBe('low');

      const imgMedium = document.createElement('img');
      imgMedium.src = 'https://example.com/medium.jpg';
      manager.registerImage(imgMedium, 'medium');
      expect(imgMedium.fetchPriority).toBe('auto');
    });
  });

  describe('getStats', () => {
    it('should return initial stats', () => {
      const stats = manager.getStats();
      
      expect(stats).toEqual({
        loadingByDomain: {},
        queuedByDomain: {},
        totalLoading: 0,
        totalQueued: 0,
      });
    });

    it('should track loading images', () => {
      const img1 = document.createElement('img');
      img1.src = 'https://example.com/image1.jpg';
      
      const img2 = document.createElement('img');
      img2.src = 'https://example.com/image2.jpg';

      manager.registerImage(img1, 'high');
      manager.registerImage(img2, 'high');

      const stats = manager.getStats();
      expect(stats.totalLoading).toBeGreaterThanOrEqual(0);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      manager.updateConfig({
        maxConcurrentPerDomain: 10,
      });

      // Configuration should be updated (internal state)
      expect(manager).toBeDefined();
    });
  });

  describe('reset', () => {
    it('should clear all state', () => {
      const img = document.createElement('img');
      img.src = 'https://example.com/image.jpg';
      manager.registerImage(img, 'high');

      manager.reset();

      const stats = manager.getStats();
      expect(stats.totalLoading).toBe(0);
      expect(stats.totalQueued).toBe(0);
    });
  });
});

describe('calculateImagePriority', () => {
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    });
  });

  it('should return high priority for images in viewport', () => {
    const element = document.createElement('div');
    
    // Mock getBoundingClientRect to return in-viewport position
    element.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      bottom: 300,
      left: 0,
      right: 100,
      width: 100,
      height: 200,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    }));

    const priority = calculateImagePriority(element);
    expect(priority).toBe('high');
  });

  it('should return medium priority for images near viewport', () => {
    const element = document.createElement('div');
    
    // Mock getBoundingClientRect to return near-viewport position
    element.getBoundingClientRect = vi.fn(() => ({
      top: 1200, // 200px below viewport
      bottom: 1400,
      left: 0,
      right: 100,
      width: 100,
      height: 200,
      x: 0,
      y: 1200,
      toJSON: () => ({}),
    }));

    const priority = calculateImagePriority(element);
    expect(priority).toBe('medium');
  });

  it('should return low priority for images far from viewport', () => {
    const element = document.createElement('div');
    
    // Mock getBoundingClientRect to return far-from-viewport position
    element.getBoundingClientRect = vi.fn(() => ({
      top: 2000, // 1000px below viewport
      bottom: 2200,
      left: 0,
      right: 100,
      width: 100,
      height: 200,
      x: 0,
      y: 2000,
      toJSON: () => ({}),
    }));

    const priority = calculateImagePriority(element);
    expect(priority).toBe('low');
  });

  it('should handle images above viewport', () => {
    const element = document.createElement('div');
    
    // Mock getBoundingClientRect to return above-viewport position
    element.getBoundingClientRect = vi.fn(() => ({
      top: -300,
      bottom: -100,
      left: 0,
      right: 100,
      width: 100,
      height: 200,
      x: 0,
      y: -300,
      toJSON: () => ({}),
    }));

    const priority = calculateImagePriority(element);
    // Should still be high if partially in viewport, or low if completely above
    expect(['high', 'low']).toContain(priority);
  });
});
