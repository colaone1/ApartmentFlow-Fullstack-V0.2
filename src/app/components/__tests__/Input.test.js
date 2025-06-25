import { render, screen, fireEvent } from '@testing-library/react'
import Input from '../Input'

describe('Input', () => {
  it('renders input with label', () => {
    render(<Input label="Test Label" name="test" />)
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders input with correct name attribute', () => {
    render(<Input label="Test Label" name="testName" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('name', 'testName')
  })

  it('renders input with correct type', () => {
    render(<Input label="Password" name="password" type="password" />)
    
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('renders input with placeholder', () => {
    render(<Input label="Test Label" name="test" placeholder="Enter text here" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', 'Enter text here')
  })

  it('renders input with default value', () => {
    render(<Input label="Test Label" name="test" defaultValue="Initial value" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('Initial value')
  })

  it('renders input with controlled value', () => {
    render(<Input label="Test Label" name="test" value="Controlled value" onChange={() => {}} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('Controlled value')
  })

  it('calls onChange handler when input value changes', () => {
    const handleChange = jest.fn()
    render(<Input label="Test Label" name="test" onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'new value' } })
    
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'new value' })
    }))
  })

  it('renders required input', () => {
    render(<Input label="Test Label" name="test" required />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeRequired()
  })

  it('renders disabled input', () => {
    render(<Input label="Test Label" name="test" disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('renders input with custom className', () => {
    render(<Input label="Test Label" name="test" className="custom-class" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('renders textarea when type is textarea', () => {
    render(<Input label="Description" name="description" type="textarea" />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('renders textarea with rows attribute', () => {
    render(<Input label="Description" name="description" type="textarea" rows={5} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('renders input with min and max attributes', () => {
    render(<Input label="Age" name="age" type="number" min={0} max={120} />)
    
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '120')
  })

  it('renders input with step attribute for number type', () => {
    render(<Input label="Price" name="price" type="number" step="0.01" />)
    
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('step', '0.01')
  })

  it('renders input with pattern attribute', () => {
    render(<Input label="Phone" name="phone" pattern="[0-9]{10}" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('pattern', '[0-9]{10}')
  })

  it('renders input with autocomplete attribute', () => {
    render(<Input label="Email" name="email" autoComplete="email" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('autocomplete', 'email')
  })

  it('renders input with aria-describedby when error is provided', () => {
    render(<Input label="Test Label" name="test" error="This field is required" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby')
  })

  it('renders error message when error is provided', () => {
    render(<Input label="Test Label" name="test" error="This field is required" />)
    
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('applies error styling when error is provided', () => {
    render(<Input label="Test Label" name="test" error="This field is required" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-500')
  })

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    
    render(<Input label="Test Label" name="test" onFocus={handleFocus} onBlur={handleBlur} />)
    
    const input = screen.getByRole('textbox')
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalled()
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalled()
  })

  it('handles key events', () => {
    const handleKeyDown = jest.fn()
    const handleKeyUp = jest.fn()
    const handleKeyPress = jest.fn()
    
    render(
      <Input 
        label="Test Label" 
        name="test" 
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onKeyPress={handleKeyPress}
      />
    )
    
    const input = screen.getByRole('textbox')
    
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(handleKeyDown).toHaveBeenCalled()
    
    fireEvent.keyUp(input, { key: 'Enter' })
    expect(handleKeyUp).toHaveBeenCalled()
    
    fireEvent.keyPress(input, { key: 'Enter' })
    expect(handleKeyPress).toHaveBeenCalled()
  })

  it('handles input with id attribute', () => {
    render(<Input label="Test Label" name="test" id="custom-id" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('id', 'custom-id')
  })

  it('associates label with input using htmlFor', () => {
    render(<Input label="Test Label" name="test" id="custom-id" />)
    
    const label = screen.getByText('Test Label')
    expect(label).toHaveAttribute('for', 'custom-id')
  })

  it('renders input with size attribute', () => {
    render(<Input label="Test Label" name="test" size={50} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('size', '50')
  })

  it('renders input with maxLength attribute', () => {
    render(<Input label="Test Label" name="test" maxLength={100} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('maxLength', '100')
  })

  it('handles input with readOnly attribute', () => {
    render(<Input label="Test Label" name="test" readOnly />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('readonly')
  })

  it('handles input with autoFocus attribute', () => {
    render(<Input label="Test Label" name="test" autoFocus />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('autofocus')
  })

  it('handles input with spellCheck attribute', () => {
    render(<Input label="Test Label" name="test" spellCheck={false} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('spellcheck', 'false')
  })

  it('handles input with tabIndex attribute', () => {
    render(<Input label="Test Label" name="test" tabIndex={0} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('tabindex', '0')
  })
}) 