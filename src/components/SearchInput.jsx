import './searchInput.css'
import { Search } from 'lucide-react'

export default function SearchInput({
  inputProduct,
  setInputProduct,
  placeholderInput,
}) {
  return (
    <div className="input-wrapper">
      <Search size={18} className="icon-search" />
      <input
        type="text"
        placeholder={placeholderInput}
        value={inputProduct}
        onChange={(e) => setInputProduct(e.target.value)}
        className="input-search"
      ></input>
    </div>
  )
}
