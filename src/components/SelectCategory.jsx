import './selectCategory.css'
import { ChevronDown } from 'lucide-react'

export default function SelectInput({ categories, idCategory, setIdCategory }) {
  return (
    <div className="select-container">
      <select
        className="input-select"
        value={idCategory}
        onChange={(e) => setIdCategory(e.target.value)}
      >
        <option value="">Seleccione categoría</option>
        {categories.map((category) => (
          <option key={category.id_category} value={category.id_category}>
            {category.name}
          </option>
        ))}
      </select>
      <ChevronDown className="select-icon" size={18} />
    </div>
  )
}
