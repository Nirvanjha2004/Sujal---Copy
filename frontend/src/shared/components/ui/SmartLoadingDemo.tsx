/**
 * Smart Loading Priority Demo Component
 * 
 * Demonstrates the smart loading priority system with:
 * - Visual indicators for priority levels
 * - Real-time loading statistics
 * - Interactive controls
 * 
 * This is a development/demo component to showcase the feature.
 */

import { useState, useEffect } from 'react';
import { OptimizedImage } from './OptimizedImage';
import { useImageLoadingStats } from '@/shared/hooks/useSmartImageLoading';
import { ImageLoadingPriorityManager } from '@/shared/utils/imageLoadingPriority';

interface DemoImage {
  id: string;
  images: {
    thumbnail_url: string;
    medium_url: string;
    large_url: string;
  };
  title: string;
  priority?: 'high' | 'medium' | 'low';
}

export function SmartLoadingDemo() {
  const [images] = useState<DemoImage[]>(
    Array.from({ length: 20 }, (_, i) => ({
      id: `image-${i}`,
      images: {
        thumbnail_url: `https://via.placeholder.com/300x200?text=Image+${i + 1}`,
        medium_url: `https://via.placeholder.com/800x600?text=Image+${i + 1}`,
        large_url: `https://via.placeholder.com/1600x1200?text=Image+${i + 1}`,
      },
      title: `Demo Image ${i + 1}`,
      priority: i < 2 ? 'high' : i < 6 ? 'medium' : 'low',
    }))
  );

  const [config, setConfig] = useState({
    maxConcurrentPerDomain: 6,
    enableDynamicPriority: true,
  });

  const stats = useImageLoadingStats();

  // Update manager config when changed
  useEffect(() => {
    const manager = ImageLoadingPriorityManager.getInstance();
    manager.updateConfig(config);
  }, [config]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Smart Image Loading Priority Demo</h1>
        <p className="text-gray-600 mb-4">
          This demo showcases the smart loading priority system. Scroll down to see how
          priorities adjust dynamically based on viewport visibility.
        </p>

        {/* Statistics Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Loading Statistics</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-2xl font-bold text-blue-600">{stats.totalLoading}</div>
              <div className="text-sm text-gray-600">Currently Loading</div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded">
              <div className="text-2xl font-bold text-yellow-600">{stats.totalQueued}</div>
              <div className="text-sm text-gray-600">Queued</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(stats.loadingByDomain).length}
              </div>
              <div className="text-sm text-gray-600">Active Domains</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-2xl font-bold text-purple-600">{config.maxConcurrentPerDomain}</div>
              <div className="text-sm text-gray-600">Max Concurrent</div>
            </div>
          </div>

          {/* Domain Details */}
          {Object.keys(stats.loadingByDomain).length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">By Domain:</h3>
              {Object.entries(stats.loadingByDomain).map(([domain, count]) => (
                <div key={domain} className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-700 truncate">{domain}</span>
                  <div className="flex gap-4">
                    <span className="text-sm">
                      <span className="font-semibold text-blue-600">{String(count)}</span> loading
                    </span>
                    <span className="text-sm">
                      <span className="font-semibold text-yellow-600">
                        {String(stats.queuedByDomain[domain as keyof typeof stats.queuedByDomain] || 0)}
                      </span> queued
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Configuration Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Concurrent Requests per Domain: {config.maxConcurrentPerDomain}
              </label>
              <input
                type="range"
                min="2"
                max="12"
                value={config.maxConcurrentPerDomain}
                onChange={(e) => setConfig({ ...config, maxConcurrentPerDomain: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>2 (Slow)</span>
                <span>6 (Optimal)</span>
                <span>12 (Fast)</span>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="dynamicPriority"
                checked={config.enableDynamicPriority}
                onChange={(e) => setConfig({ ...config, enableDynamicPriority: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="dynamicPriority" className="text-sm font-medium text-gray-700">
                Enable Dynamic Priority Adjustment
              </label>
            </div>
          </div>
        </div>

        {/* Priority Legend */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Priority Levels</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <div>
                <div className="font-semibold">High Priority</div>
                <div className="text-sm text-gray-600">Above-the-fold, critical images</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <div>
                <div className="font-semibold">Medium Priority</div>
                <div className="text-sm text-gray-600">Near viewport (&lt;500px)</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <div>
                <div className="font-semibold">Low Priority</div>
                <div className="text-sm text-gray-600">Below-fold, far from viewport</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div key={image.id} className="relative">
            {/* Priority Indicator */}
            <div className="absolute top-2 left-2 z-10">
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                  image.priority === 'high'
                    ? 'bg-red-500'
                    : image.priority === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                }`}
              >
                {image.priority?.toUpperCase()} PRIORITY
              </div>
            </div>

            {/* Position Indicator */}
            <div className="absolute top-2 right-2 z-10">
              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-white">
                #{index + 1}
              </div>
            </div>

            {/* Image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <OptimizedImage
                images={image.images}
                alt={image.title}
                context="grid"
                priority={index < 2}
                enableSmartLoading={true}
                fetchPriority={
                  image.priority === 'high' ? 'high' : image.priority === 'low' ? 'low' : 'auto'
                }
                className="aspect-video"
                showSkeleton={true}
              />
              <div className="p-4">
                <h3 className="font-semibold">{image.title}</h3>
                <p className="text-sm text-gray-600">
                  {index < 2 ? 'Above-the-fold' : index < 6 ? 'Near viewport' : 'Below-fold'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How to Test:</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Open DevTools Network tab and throttle to "Fast 3G"</li>
          <li>Reload the page and observe loading order (top images load first)</li>
          <li>Watch the statistics panel to see concurrent request limiting</li>
          <li>Scroll down slowly and see how priorities adjust dynamically</li>
          <li>Adjust the max concurrent slider to see the effect on loading</li>
          <li>Toggle dynamic priority to compare behavior</li>
        </ol>
      </div>
    </div>
  );
}
