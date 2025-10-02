import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './SearchCompanies.css'

type Company = {
	_id: string
	names: { name: string }[]
	addresses: {
		street: string
		postCode: string
		postOffices: { city: string }[]
		buildingNumber: string
	}[]
}

const SearchCompanies: React.FC = () => {
	const [city, setCity] = useState('')
	const [companies, setCompanies] = useState<Company[]>([])
	const [loading, setLoading] = useState(false)
	const [page, setPage] = useState(1)
	const [total, setTotal] = useState(0)
	const [searchTerm, setSearchTerm] = useState('')
	const [hasSearched, setHasSearched] = useState(false)

	const pageSize = 10

	const fetchCompanies = async (term: string = searchTerm, currentPage: number = page) => {
		if (!term.trim()) return
		setLoading(true)
		try {
			const response = await axios.get(
				'https://ohjelmistoalan-yritysten-haku-backend-1.onrender.com/api/companies',
				{
					params: { city: term, page: currentPage },
				},
			)
			setCompanies(response.data.companies)
			setTotal(response.data.total)
		} catch (error) {
			console.error('Virhe:', error)
		}
		setLoading(false)
	}

	const clearResults = () => {
		setCompanies([])
		setTotal(0)
		setPage(1)
		setCity('')
		setSearchTerm('')
		setHasSearched(false)
	}

	const handleSearch = () => {
		setSearchTerm(city)
		setPage(1)
		setHasSearched(true)
		fetchCompanies(city, 1)
	}

	useEffect(() => {
		if (searchTerm.trim()) {
			fetchCompanies(searchTerm, page)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page])

	const totalPages = Math.ceil(total / pageSize)

	const renderPagination = () => {
		if (totalPages <= 1) return null

		const pages: (number | string)[] = []

		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i)
		} else {
			pages.push(1)

			if (page > 3) pages.push('...')

			const start = Math.max(2, page - 1)
			const end = Math.min(totalPages - 1, page + 1)

			for (let i = start; i <= end; i++) {
				pages.push(i)
			}

			if (page < totalPages - 2) pages.push('...')

			pages.push(totalPages)
		}

		return (
			<div className="pagination">
				<button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
					←
				</button>
				{pages.map((p, i) =>
					p === '...' ? (
						<span key={i} className="pagination-dots">
							…
						</span>
					) : (
						<button key={i} onClick={() => setPage(Number(p))} className={page === p ? 'active' : ''}>
							{p}
						</button>
					),
				)}
				<button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
					→
				</button>
			</div>
		)
	}

	return (
		<div className="container">
			<h1>Etsi yrityksiä kaupungin perusteella</h1>

			<div className="search-bar">
				<input
					type="text"
					placeholder="Syötä kaupungin nimi"
					value={city}
					onChange={(e) => setCity(e.target.value)}
				/>
				<button onClick={handleSearch}>🔍</button>
				<button onClick={clearResults}>❌</button>
			</div>

			{loading && <p>Ladataan...</p>}

			{!loading && companies.length > 0 && (
				<>
					<div className="company-list">
						{companies.map((company) => {
							const name = company.names?.[0]?.name ?? 'Nimetön yritys'
							const address = company.addresses?.[0]
							const street = address?.street ?? ''
							const number = address?.buildingNumber ?? ''
							const city = address?.postOffices?.[0]?.city ?? ''
							const fullAddress = `${street} ${number}, ${city}`.trim()
							const mapsLink = fullAddress
								? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
								: null

							return (
								<div key={company._id} className="company-card">
									<div className="company-info">
										<h2>{name}</h2>
										<p className="company-address">{fullAddress || 'Ei osoitetta'}</p>
									</div>
									{mapsLink && (
										<a
											href={mapsLink}
											target="_blank"
											rel="noopener noreferrer"
											className="maps-link"
										>
											🗺️ Kartalla
										</a>
									)}
								</div>
							)
						})}
					</div>

					{renderPagination()}
				</>
			)}

			{!loading && companies.length === 0 && hasSearched && (
				<p>Yrityksiä ei löytynyt kaupungista "{searchTerm}"</p>
			)}
		</div>
	)
}

export default SearchCompanies
