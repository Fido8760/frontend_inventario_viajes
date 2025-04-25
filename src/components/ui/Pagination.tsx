import { Link } from "react-router-dom"

type PaginationProps = {
    page: number
    totalPages: number
}

export default function Pagination({page, totalPages} : PaginationProps) {

    const pages = Array.from({length: totalPages}, (_, i) => i + 1)

    return (
        <nav className=" flex justify-center py-10">
            {page > 1 && (
                <Link
                    className={` px-4 py-2 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0`}
                    to={`/?page=${page - 1}`}
                >&laquo;</Link>            
            )}
            {pages.map(currentPage => (
                <Link
                    key={currentPage}
                    to={`/?page=${currentPage}`}
                    className={`${page === currentPage ? 'bg-blue-600 text-white font-bold' : ''} px-4 py-2 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0`}
                    aria-current={page === currentPage ? "page" : undefined}
                >{currentPage}</Link>
            ))}

            {page < totalPages && (
                <Link
                    className={` px-4 py-2 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0`}
                    to={`/?page=${page + 1}`}
                >&raquo;</Link>            
            )}

            
        </nav>
    )
}
