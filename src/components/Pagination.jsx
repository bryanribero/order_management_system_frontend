import { getPages } from '../utils/getPages'
import './pagination.css'

export default function Pagination({
  currentPage,
  setCurrentPage,
  totalPages,
}) {
  const pages = getPages(currentPage, totalPages)
  return (
    <div className="pagination">
      <button
        disabled={currentPage <= 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        ←
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={index}>...</span>
        ) : (
          <button
            key={page}
            className={currentPage === page ? 'active' : ''}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        disabled={currentPage >= totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        →
      </button>
    </div>
  )
}
