import { describe, it, expect } from '@jest/globals';

describe('CLI Tool', () => {
  it('should be importable', () => {
    // Basic test to ensure the module can be imported
    expect(() => {
      require('../index');
    }).not.toThrow();
  });

  it('should have a main function', () => {
    // Test that the main entry point exists
    const index = require('../index');
    expect(index).toBeDefined();
  });
});
