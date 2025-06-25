import { render, screen, fireEvent } from '@testing-library/react';
import FavoriteButton from '../FavoriteButton';

describe('FavoriteButton', () => {
  it('renders with correct initial state', () => {
    render(<FavoriteButton apartmentId="1" isInitiallyFavorited={false} />);
    expect(screen.getByRole('button')).toHaveTextContent('🤍');
  });

  it('toggles favorite state on click', () => {
    render(<FavoriteButton apartmentId="1" isInitiallyFavorited={false} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(button).toHaveTextContent('💖');
    fireEvent.click(button);
    expect(button).toHaveTextContent('🤍');
  });
}); 