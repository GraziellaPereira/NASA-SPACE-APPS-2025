interface InputLocalidadeProps {
    value: string;        // Valor da localidade
    onChange: React.ChangeEventHandler<HTMLInputElement>;  // Função para lidar com a mudança de valor
    onClick: () => void;  // Função que será chamada ao clicar
    placeholder: string;  // Texto de sugestão no campo
}

export function InputActionMaps({ value, onChange, onClick, placeholder }: InputLocalidadeProps) {
    return (
        <div className="informationMaps">
            <h1>Localidade</h1>
            <input
                type="text"
                value={value}
                onChange={onChange}
                onClick={onClick}
                placeholder={placeholder}
            />
        </div>
    );
}

