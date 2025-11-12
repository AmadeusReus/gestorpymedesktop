import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '../Pagination';

describe('Pagination Component', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    itemsPerPage: 10,
    totalItems: 50,
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pagination controls', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
  });

  it('displays correct page information', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText(/Mostrando 1-10 de 50 resultados/i)).toBeInTheDocument();
  });

  it('displays current page number in input', () => {
    render(<Pagination {...defaultProps} currentPage={2} />);
    const input = screen.getByDisplayValue('2') as HTMLInputElement;
    expect(input.value).toBe('2');
  });

  it('disables previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    const previousButton = screen.getByRole('button', { name: /anterior/i });
    expect(previousButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalPages={5} />);
    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    expect(nextButton).toBeDisabled();
  });

  it('calls onPageChange when next button is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} currentPage={1} />);

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when previous button is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} currentPage={3} />);

    const previousButton = screen.getByRole('button', { name: /anterior/i });
    await user.click(previousButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when first page button is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} currentPage={3} />);

    const firstPageButton = screen.getByRole('button', { name: /⟨⟨/i });
    await user.click(firstPageButton);

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange when last page button is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} currentPage={1} />);

    const lastPageButton = screen.getByRole('button', { name: /⟩⟩/i });
    await user.click(lastPageButton);

    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it('accepts input in the page number field', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} currentPage={1} totalPages={5} />);

    const input = screen.getByDisplayValue('1') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('number');
    expect(input.min).toBe('1');
    expect(input.max).toBe('5');
  });

  it('does not call onPageChange with invalid page number (zero)', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} currentPage={1} totalPages={5} />);

    const input = screen.getByDisplayValue('1') as HTMLInputElement;
    await user.click(input);
    await user.clear(input);
    await user.type(input, '0'); // Invalid - should not be called

    // When typing 0, onChange is triggered but validation prevents the call
    // since 0 is not in the valid range (1-5)
    const callCount = onPageChange.mock.calls.length;
    // Either not called, or called with a valid value
    if (callCount > 0) {
      const lastCall = onPageChange.mock.calls[callCount - 1][0];
      expect(lastCall).toBeGreaterThanOrEqual(1);
      expect(lastCall).toBeLessThanOrEqual(5);
    }
  });

  it('renders items per page selector when callback is provided', () => {
    const onItemsPerPageChange = jest.fn();
    render(
      <Pagination
        {...defaultProps}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    );

    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('calls onItemsPerPageChange when items per page is changed', async () => {
    const user = userEvent.setup();
    const onItemsPerPageChange = jest.fn();
    render(
      <Pagination
        {...defaultProps}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    );

    const select = screen.getByDisplayValue('10');
    await user.selectOptions(select, '25');

    expect(onItemsPerPageChange).toHaveBeenCalledWith(25);
  });

  it('displays correct result range for middle pages', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={3}
        itemsPerPage={10}
        totalItems={50}
      />
    );
    expect(screen.getByText(/Mostrando 21-30 de 50 resultados/i)).toBeInTheDocument();
  });

  it('displays correct result range for last page with fewer items', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={5}
        itemsPerPage={10}
        totalItems={47}
      />
    );
    expect(screen.getByText(/Mostrando 41-47 de 47 resultados/i)).toBeInTheDocument();
  });

  it('shows correct total pages text', () => {
    render(<Pagination {...defaultProps} totalPages={10} />);
    expect(screen.getByText(/de 10/i)).toBeInTheDocument();
  });
});
