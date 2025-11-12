import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tooltip from '../Tooltip';

describe('Tooltip Component', () => {
  it('renders tooltip trigger button', () => {
    render(<Tooltip text="Help text" />);
    const button = screen.getByRole('button', { name: '?' });
    expect(button).toBeInTheDocument();
  });

  it('does not show tooltip content initially', () => {
    render(<Tooltip text="Help text" />);
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });

  it('shows tooltip content on mouse enter', async () => {
    const user = userEvent.setup({ delay: null });
    render(<Tooltip text="Help text" />);
    const button = screen.getByRole('button', { name: '?' });

    await user.hover(button);
    // Small delay to ensure state update
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.getByText('Help text')).toBeInTheDocument();
  });

  it('hides tooltip content on mouse leave', async () => {
    const user = userEvent.setup({ delay: null });
    render(<Tooltip text="Help text" />);
    const button = screen.getByRole('button', { name: '?' });

    await user.hover(button);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.getByText('Help text')).toBeInTheDocument();

    await user.unhover(button);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });

  it('toggles tooltip visibility on click', async () => {
    const user = userEvent.setup({ delay: null });
    render(<Tooltip text="Help text" />);
    const button = screen.getByRole('button', { name: '?' });

    // Initially hidden
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();

    // Show on click
    await user.click(button);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.getByText('Help text')).toBeInTheDocument();

    // Hide on second click
    await user.click(button);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });

  it('displays long text', async () => {
    const user = userEvent.setup({ delay: null });
    const longText = 'This is a long help text that spans multiple words';
    render(<Tooltip text={longText} />);
    const button = screen.getByRole('button', { name: '?' });

    await user.hover(button);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('renders children inside tooltip content', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <Tooltip text="Main text">
        <div>Child content</div>
      </Tooltip>
    );
    const button = screen.getByRole('button', { name: '?' });

    await user.hover(button);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.getByText('Main text')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('has title attribute for accessibility', () => {
    render(<Tooltip text="Help text" />);
    const button = screen.getByRole('button', { name: '?' });
    expect(button).toHaveAttribute('title', 'Haz clic para más información');
  });

  it('applies tooltip-container class', () => {
    const { container } = render(<Tooltip text="Help text" />);
    const tooltipContainer = container.querySelector('.tooltip-container');
    expect(tooltipContainer).toBeInTheDocument();
  });

  it('applies tooltip-trigger class to button', () => {
    render(<Tooltip text="Help text" />);
    const button = screen.getByRole('button', { name: '?' });
    expect(button).toHaveClass('tooltip-trigger');
  });

  it('applies tooltip-content class to content div when visible', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<Tooltip text="Help text" />);
    const button = screen.getByRole('button', { name: '?' });

    await user.hover(button);
    await new Promise(resolve => setTimeout(resolve, 50));
    const tooltipContent = container.querySelector('.tooltip-content');
    expect(tooltipContent).toBeInTheDocument();
  });

  it('handles empty text gracefully', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<Tooltip text="" />);
    const button = screen.getByRole('button', { name: '?' });

    await user.hover(button);
    await new Promise(resolve => setTimeout(resolve, 50));
    const tooltipContent = container.querySelector('.tooltip-content');
    expect(tooltipContent).toBeInTheDocument();
  });

  it('handles special characters in text', async () => {
    const user = userEvent.setup({ delay: null });
    const specialText = 'Special chars: <>&"\'';
    render(<Tooltip text={specialText} />);
    const button = screen.getByRole('button', { name: '?' });

    await user.hover(button);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.getByText(specialText)).toBeInTheDocument();
  });
});
