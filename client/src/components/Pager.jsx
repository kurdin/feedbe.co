const Pager = ({ perPage, length, page = 1, onChange }) => {
	const handleGoToPage = page => e => {
		e.preventDefault();
		if (page) onChange(page);
	};

	const totalPages = Math.ceil(length / perPage);
	const prevPage = page - 1 === 0 ? null : page - 1;
	const nextPage = page + 1 <= totalPages ? page + 1 : null;

	if (totalPages < 2) return null;

	return (
		<nav class="pagination is-centered" role="navigation" aria-label="pagination">
			<a href="/#" class={`pagination-previous${!prevPage ? ' disabled' : ''}`} onClick={handleGoToPage(prevPage)}>
				<span class="icon" style={{ fontSize: 23, verticalAlign: 'middle' }}>
					&#212;
				</span>{' '}
				Previous
			</a>
			<a href="/#" class={`pagination-next${!nextPage ? ' disabled' : ''}`} onClick={handleGoToPage(nextPage)}>
				Next page{' '}
				<span class="icon" style={{ fontSize: 23, verticalAlign: 'middle' }}>
					&#215;
				</span>
			</a>
			<ul class="pagination-list">
				<li>
					<a href="/#" class={`pagination-link${!prevPage ? ' disabled' : ''}`} aria-label="page 1" onClick={handleGoToPage(1)}>
						1
					</a>
				</li>
				<li>
					<span class="pagination-ellipsis">&hellip;</span>
				</li>
				<li>
					{prevPage ? (
						<a href="/#" class="pagination-link" onClick={handleGoToPage(prevPage)}>
							{prevPage}
						</a>
					) : (
						<a href="/#" class="pagination-link disabled" onClick={handleGoToPage(null)}>
							{' '}
						</a>
					)}
				</li>
				<li>
					<span class="pagination-link is-current">{page}</span>
				</li>
				<li>
					{nextPage ? (
						<a href="/#" class="pagination-link" onClick={handleGoToPage(nextPage)}>
							{nextPage}
						</a>
					) : (
						<a href="/#" class="pagination-link disabled" onClick={handleGoToPage(null)}>
							{' '}
						</a>
					)}
				</li>
				<li>
					<span class="pagination-ellipsis">&hellip;</span>
				</li>
				<li>
					<a href="/#" class={`pagination-link${!nextPage ? ' disabled' : ''}`} aria-label={`Page ${totalPages}`} onClick={handleGoToPage(totalPages)}>
						{totalPages}
					</a>
				</li>
			</ul>
		</nav>
	);
};

export default Pager;
