type TextAreaProps = {
    value?: string
    placeholder?: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    className?: string
    rows?: number
}

const TextArea = ({ value = '', placeholder, onChange, className, rows }: TextAreaProps) => {
    return (
        <textarea
            className={className}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows}
            required
        />
    )
}

export default TextArea