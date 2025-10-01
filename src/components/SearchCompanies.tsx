import React, { useState, useEffect } from 'react'
import axios from 'axios'

type Company = {
	_id: string
	names: { name: string }[]
	addresses: {
		street: string
		postCode: string
		postOffices: { city: string }[]
	}[]
}

const SearchCompanies: React.FC = () => {
	const [city, setCity] = useState('')
	const [companies, setCompanies] = useState<Company[]>([])
	const [loading, setLoading] = useState(false)
	const [page, setPage] = useState(1)
	const [total, setTotal] = useState(0)

	const pageSize = 10

	const fetchCompanies = async () => {
		if (!city.trim()) return
		setLoading(true)
		try {
			const response = await axios.get(`https://ohjelmistoalan-yritysten-haku-backend-1.onrender.com/api/companies`, {
				params: { city, page },
			})
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
	}

	useEffect(() => {
		if (city.trim()) {
			fetchCompanies()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page])

	const totalPages = Math.ceil(total / pageSize)

	return (
		<div style={{ padding: '2rem' }}>
			<h1>Etsi yrityksiä kaupungin perusteella</h1>

			<div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
				<input
					type="text"
					placeholder="Syötä kaupungin nimi"
					value={city}
					onChange={(e) => setCity(e.target.value)}
				/>
				<button onClick={fetchCompanies}>🔍</button>
				<button onClick={clearResults}>❌</button>
			</div>

			{loading && <p>Ladataan...</p>}

			{!loading && companies.length > 0 && (
				<>
					<ul>
						{companies.map((company) => (
							<li key={company._id}>
								{company.names?.[0]?.name ?? 'Nimetön yritys'} –{' '}
								{company.addresses?.[0]?.postOffices?.[0]?.city}
							</li>
						))}
					</ul>

					<div style={{ marginTop: '1rem' }}>
						{Array.from({ length: totalPages }, (_, i) => (
							<button
								key={i}
								onClick={() => setPage(i + 1)}
								style={{
									marginRight: '0.5rem',
									fontWeight: page === i + 1 ? 'bold' : 'normal',
								}}
							>
								{i + 1}
							</button>
						))}
					</div>
				</>
			)}

			{!loading && companies.length === 0 && city && <p>Yrityksiä ei löytynyt kaupungista "{city}"</p>}
		</div>
	)
}

export default SearchCompanies