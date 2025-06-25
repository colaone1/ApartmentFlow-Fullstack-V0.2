import { fileToBase64 } from '../fileHelpers';

describe('fileHelpers', () => {
  describe('fileToBase64', () => {
    it('converts file to base64', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const result = await fileToBase64(file);
      expect(result).toMatch(/^data:text\/plain;base64,/);
    });

    it('rejects on error', async () => {
      const mockFile = {
        // Mock file that will cause FileReader to fail
      };
      
      await expect(fileToBase64(mockFile)).rejects.toThrow();
    });
  });
}); 