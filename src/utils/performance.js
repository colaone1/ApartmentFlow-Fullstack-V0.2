// AI-OPTIMIZED: Frontend Performance Monitoring Utility

/**
 * Performance monitoring class for frontend optimization
 * Tracks page load times, component render times, and user interactions
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoads: [],
      componentRenders: [],
      userInteractions: [],
      errors: [],
    };

    this.isEnabled =
      process.env.NODE_ENV === 'development' ||
      process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING === 'true';

    if (this.isEnabled) {
      this.initializeMonitoring();
    }
  }

  // AI-OPTIMIZED: Initialize performance monitoring
  initializeMonitoring() {
    // Monitor page load performance
    if (typeof window !== 'undefined') {
      this.monitorPageLoad();
      this.monitorUserInteractions();
      this.monitorErrors();
    }
  }

  // AI-OPTIMIZED: Monitor page load performance
  monitorPageLoad() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      const metrics = {
        timestamp: new Date().toISOString(),
        type: 'pageLoad',
        url: window.location.href,
        domContentLoaded:
          navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        firstPaint: paint.find((entry) => entry.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find((entry) => entry.name === 'first-contentful-paint')
          ?.startTime,
        totalLoadTime: navigation?.loadEventEnd - navigation?.fetchStart,
      };

      this.metrics.pageLoads.push(metrics);
      this.logSlowPageLoad(metrics);
    });
  }

  // AI-OPTIMIZED: Monitor user interactions
  monitorUserInteractions() {
    let interactionStart = null;

    document.addEventListener('mousedown', () => {
      interactionStart = performance.now();
    });

    document.addEventListener('mouseup', () => {
      if (interactionStart) {
        const duration = performance.now() - interactionStart;
        this.metrics.userInteractions.push({
          timestamp: new Date().toISOString(),
          type: 'click',
          duration,
          url: window.location.href,
        });

        if (duration > 100) {
          console.warn(`SLOW INTERACTION: Click took ${duration.toFixed(2)}ms`);
        }

        interactionStart = null;
      }
    });
  }

  // AI-OPTIMIZED: Monitor errors
  monitorErrors() {
    window.addEventListener('error', (event) => {
      this.metrics.errors.push({
        timestamp: new Date().toISOString(),
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errors.push({
        timestamp: new Date().toISOString(),
        type: 'promise',
        message: event.reason?.message || 'Unhandled promise rejection',
        url: window.location.href,
      });
    });
  }

  // AI-OPTIMIZED: Monitor component render performance
  monitorComponentRender(componentName, renderTime) {
    if (!this.isEnabled) return;

    this.metrics.componentRenders.push({
      timestamp: new Date().toISOString(),
      component: componentName,
      renderTime,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    });

    if (renderTime > 16) {
      // Longer than one frame at 60fps
      console.warn(`SLOW COMPONENT RENDER: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  }

  // AI-OPTIMIZED: Log slow page loads
  logSlowPageLoad(metrics) {
    if (metrics.totalLoadTime > 3000) {
      console.warn(
        `SLOW PAGE LOAD: ${window.location.href} took ${metrics.totalLoadTime.toFixed(2)}ms`
      );
    }
  }

  // AI-OPTIMIZED: Get performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      summary: this.generateSummary(),
    };
  }

  // AI-OPTIMIZED: Generate performance summary
  generateSummary() {
    const pageLoads = this.metrics.pageLoads;
    const componentRenders = this.metrics.componentRenders;
    const userInteractions = this.metrics.userInteractions;
    const errors = this.metrics.errors;

    return {
      totalPageLoads: pageLoads.length,
      averagePageLoadTime:
        pageLoads.length > 0
          ? pageLoads.reduce((sum, load) => sum + (load.totalLoadTime || 0), 0) / pageLoads.length
          : 0,
      totalComponentRenders: componentRenders.length,
      averageRenderTime:
        componentRenders.length > 0
          ? componentRenders.reduce((sum, render) => sum + render.renderTime, 0) /
            componentRenders.length
          : 0,
      totalUserInteractions: userInteractions.length,
      averageInteractionTime:
        userInteractions.length > 0
          ? userInteractions.reduce((sum, interaction) => sum + interaction.duration, 0) /
            userInteractions.length
          : 0,
      totalErrors: errors.length,
      errorRate: pageLoads.length > 0 ? (errors.length / pageLoads.length) * 100 : 0,
    };
  }

  // AI-OPTIMIZED: Clear metrics
  clearMetrics() {
    this.metrics = {
      pageLoads: [],
      componentRenders: [],
      userInteractions: [],
      errors: [],
    };
  }

  // AI-OPTIMIZED: Export metrics to backend
  async exportMetrics() {
    if (!this.isEnabled) return;

    try {
      const metrics = this.getMetrics();
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metrics),
      });

      if (response.ok) {
        console.log('Performance metrics exported successfully');
      }
    } catch (error) {
      console.error('Failed to export performance metrics:', error);
    }
  }
}

// AI-OPTIMIZED: Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// AI-OPTIMIZED: React hook for component performance monitoring
export const usePerformanceMonitor = (componentName) => {
  const startRender = () => {
    if (performanceMonitor.isEnabled) {
      return performance.now();
    }
    return null;
  };

  const endRender = (startTime) => {
    if (startTime && performanceMonitor.isEnabled) {
      const renderTime = performance.now() - startTime;
      performanceMonitor.monitorComponentRender(componentName, renderTime);
    }
  };

  return { startRender, endRender };
};

// AI-OPTIMIZED: Higher-order component for performance monitoring
export const withPerformanceMonitor = (WrappedComponent, componentName) => {
  return function PerformanceMonitoredComponent(props) {
    const { startRender, endRender } = usePerformanceMonitor(componentName);

    React.useEffect(() => {
      const startTime = startRender();
      return () => endRender(startTime);
    });

    return <WrappedComponent {...props} />;
  };
};

export default performanceMonitor;
