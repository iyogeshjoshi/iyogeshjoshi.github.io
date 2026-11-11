import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Placeholder } from './Placeholder';

describe('Placeholder', () => {
  it('renders an accessible main landmark with heading', () => {
    render(<Placeholder />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'deviloper.dev' })
    ).toBeInTheDocument();
    expect(screen.getByText('Catalog coming soon.')).toBeInTheDocument();
  });
});
