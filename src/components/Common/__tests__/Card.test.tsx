import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../Card';

describe('Card Component', () => {
  it('renders card with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders card with title', () => {
    render(<Card title="Test Title">Content</Card>);
    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
  });

  it('renders card with subtitle', () => {
    render(<Card subtitle="Test Subtitle">Content</Card>);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders both title and subtitle', () => {
    render(
      <Card title="Title" subtitle="Subtitle">
        Content
      </Card>
    );
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('renders card with footer', () => {
    render(
      <Card footer={<div>Footer content</div>}>
        Card content
      </Card>
    );
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('renders without header when no title or subtitle', () => {
    const { container } = render(<Card>Content</Card>);
    const header = container.querySelector('.card__header');
    expect(header).not.toBeInTheDocument();
  });

  it('applies card class', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.querySelector('.card');
    expect(card).toBeInTheDocument();
  });

  it('applies elevated class when elevated prop is true', () => {
    const { container } = render(<Card elevated>Content</Card>);
    const card = container.querySelector('.card');
    expect(card).toHaveClass('card--elevated');
  });

  it('does not apply elevated class by default', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.querySelector('.card');
    expect(card).not.toHaveClass('card--elevated');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom">Content</Card>);
    const card = container.querySelector('.card');
    expect(card).toHaveClass('custom');
  });

  it('applies no-padding class when noPadding is true', () => {
    const { container } = render(<Card noPadding>Content</Card>);
    const content = container.querySelector('.card__content');
    expect(content).toHaveClass('card__content--no-padding');
  });

  it('does not apply no-padding class by default', () => {
    const { container } = render(<Card>Content</Card>);
    const content = container.querySelector('.card__content');
    expect(content).not.toHaveClass('card__content--no-padding');
  });

  it('renders complex children', () => {
    render(
      <Card>
        <h4>Nested Heading</h4>
        <p>Nested paragraph</p>
      </Card>
    );
    expect(screen.getByRole('heading', { name: 'Nested Heading' })).toBeInTheDocument();
    expect(screen.getByText('Nested paragraph')).toBeInTheDocument();
  });

  it('renders all parts together', () => {
    const { container } = render(
      <Card
        title="Main Title"
        subtitle="Main Subtitle"
        footer={<button>Footer Button</button>}
        className="test-card"
        elevated
      >
        Main content
      </Card>
    );

    const card = container.querySelector('.card');
    expect(card).toHaveClass('card--elevated', 'test-card');
    expect(screen.getByRole('heading', { name: 'Main Title' })).toBeInTheDocument();
    expect(screen.getByText('Main Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Footer Button' })).toBeInTheDocument();
  });

  it('applies header class structure', () => {
    const { container } = render(
      <Card title="Title" subtitle="Subtitle">
        Content
      </Card>
    );
    const header = container.querySelector('.card__header');
    expect(header).toBeInTheDocument();
    const title = header?.querySelector('.card__title');
    const subtitle = header?.querySelector('.card__subtitle');
    expect(title).toBeInTheDocument();
    expect(subtitle).toBeInTheDocument();
  });

  it('renders footer with correct class', () => {
    const { container } = render(
      <Card footer={<span>Footer</span>}>
        Content
      </Card>
    );
    const footer = container.querySelector('.card__footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent('Footer');
  });
});
