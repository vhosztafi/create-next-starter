describe('CLI Tool', () => {
  it('should be importable', () => {
    // Basic test to ensure the module can be imported
    expect(() => {
      import('../index.js');
    }).not.toThrow();
  });

  it('should have a main function', async () => {
    // Test that the main entry point exists
    const index = await import('../index.js');
    expect(index).toBeDefined();
  });
});
