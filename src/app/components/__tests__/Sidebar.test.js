import { render, screen } from '@testing-library/react';
// eslint-disable-next-line no-unused-vars
import Sidebar from '../Sidebar';

describe('Sidebar', () => {
  it('renders filter controls', () => {
    render(<Sidebar />);
    expect(screen.getAllByText(/filters/i).length).toBeGreaterThan(0);
  });

  it('handles accessibility features', () => {
    render(<Sidebar />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThan(0);
    sliders.forEach((slider) => {
      expect(slider).toHaveAttribute('min');
      expect(slider).toHaveAttribute('max');
      expect(slider).toHaveAttribute('value');
    });
  });

  it('handles filter loading state', () => {
    render(<Sidebar loading={true} />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThan(0);
  });

  it('handles price range with custom min/max', () => {
    render(<Sidebar minPrice={500} maxPrice={5000} />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThan(0);
  });
});
