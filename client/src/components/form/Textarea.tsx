type TextAreaProps = {
    value?: string
    placeholder?: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    className?: string
    rows?: number
    maxLength?: number
}

const TextArea = ({ value = '', placeholder, onChange, className, rows, maxLength }: TextAreaProps) => {
    return (
        <textarea
            className={className}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows}
            maxLength={maxLength}
            required
        />
    )
}

export default TextArea