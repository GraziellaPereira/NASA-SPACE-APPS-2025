import './stylesInput.css'

interface inputMapsProps {
    label: string;        // O título do campo
    value: string | number;  // O valor do input (pode ser texto ou número)
    placeholder: string;  // Texto de sugestão no campo
    disabled: boolean;    // Se o campo deve ser desabilitado
}

export function InputsMaps(
    { 
        label, 
        value, 
        placeholder, 
        disabled 
    }: inputMapsProps) {
    return (
        <div className="inputContainer">
            <h1 className='titleInputs' >{label}</h1>
            <input className='inputGeneric'
                type="text"
                value={value}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={disabled} // Se disabled for true, o campo será somente leitura
            />
        </div>
    );
}


