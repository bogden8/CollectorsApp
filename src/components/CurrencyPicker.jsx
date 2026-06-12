import { useState, useRef, useEffect } from 'react'
import Icon from '../icons'

const CURRENCIES = [
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'ALL', symbol: 'L',   name: 'Albanian Lek' },
  { code: 'AMD', symbol: '֏',   name: 'Armenian Dram' },
  { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso' },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar' },
  { code: 'AZN', symbol: '₼',   name: 'Azerbaijani Manat' },
  { code: 'BAM', symbol: 'KM',  name: 'Bosnia Mark' },
  { code: 'BDT', symbol: '৳',   name: 'Bangladeshi Taka' },
  { code: 'BGN', symbol: 'лв',  name: 'Bulgarian Lev' },
  { code: 'BHD', symbol: 'BD',  name: 'Bahraini Dinar' },
  { code: 'BOB', symbol: 'Bs',  name: 'Bolivian Boliviano' },
  { code: 'BRL', symbol: 'R$',  name: 'Brazilian Real' },
  { code: 'BWP', symbol: 'P',   name: 'Botswana Pula' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso' },
  { code: 'CNY', symbol: 'CN¥', name: 'Chinese Yuan' },
  { code: 'COP', symbol: 'CO$', name: 'Colombian Peso' },
  { code: 'CRC', symbol: '₡',   name: 'Costa Rican Colón' },
  { code: 'CZK', symbol: 'Kč',  name: 'Czech Koruna' },
  { code: 'DKK', symbol: 'kr',  name: 'Danish Krone' },
  { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso' },
  { code: 'DZD', symbol: 'DA',  name: 'Algerian Dinar' },
  { code: 'EGP', symbol: 'E£',  name: 'Egyptian Pound' },
  { code: 'ETB', symbol: 'Br',  name: 'Ethiopian Birr' },
  { code: 'EUR', symbol: '€',   name: 'Euro' },
  { code: 'GBP', symbol: '£',   name: 'British Pound' },
  { code: 'GEL', symbol: '₾',   name: 'Georgian Lari' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'GTQ', symbol: 'Q',   name: 'Guatemalan Quetzal' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'HNL', symbol: 'L',   name: 'Honduran Lempira' },
  { code: 'HRK', symbol: 'kn',  name: 'Croatian Kuna' },
  { code: 'HUF', symbol: 'Ft',  name: 'Hungarian Forint' },
  { code: 'IDR', symbol: 'Rp',  name: 'Indonesian Rupiah' },
  { code: 'ILS', symbol: '₪',   name: 'Israeli Shekel' },
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee' },
  { code: 'ISK', symbol: 'kr',  name: 'Icelandic Króna' },
  { code: 'JMD', symbol: 'J$',  name: 'Jamaican Dollar' },
  { code: 'JOD', symbol: 'JD',  name: 'Jordanian Dinar' },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'KHR', symbol: '៛',   name: 'Cambodian Riel' },
  { code: 'KRW', symbol: '₩',   name: 'South Korean Won' },
  { code: 'KWD', symbol: 'KD',  name: 'Kuwaiti Dinar' },
  { code: 'KZT', symbol: '₸',   name: 'Kazakhstani Tenge' },
  { code: 'LAK', symbol: '₭',   name: 'Laotian Kip' },
  { code: 'LBP', symbol: 'L£',  name: 'Lebanese Pound' },
  { code: 'LKR', symbol: 'Rs',  name: 'Sri Lankan Rupee' },
  { code: 'LYD', symbol: 'LD',  name: 'Libyan Dinar' },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham' },
  { code: 'MDL', symbol: 'L',   name: 'Moldovan Leu' },
  { code: 'MKD', symbol: 'ден', name: 'North Macedonian Denar' },
  { code: 'MMK', symbol: 'K',   name: 'Myanmar Kyat' },
  { code: 'MNT', symbol: '₮',   name: 'Mongolian Tugrik' },
  { code: 'MUR', symbol: '₨',   name: 'Mauritian Rupee' },
  { code: 'MVR', symbol: 'Rf',  name: 'Maldivian Rufiyaa' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'MYR', symbol: 'RM',  name: 'Malaysian Ringgit' },
  { code: 'MZN', symbol: 'MT',  name: 'Mozambican Metical' },
  { code: 'NAD', symbol: 'N$',  name: 'Namibian Dollar' },
  { code: 'NGN', symbol: '₦',   name: 'Nigerian Naira' },
  { code: 'NIO', symbol: 'C$',  name: 'Nicaraguan Córdoba' },
  { code: 'NOK', symbol: 'kr',  name: 'Norwegian Krone' },
  { code: 'NPR', symbol: 'Rs',  name: 'Nepalese Rupee' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial' },
  { code: 'PAB', symbol: 'B/',  name: 'Panamanian Balboa' },
  { code: 'PEN', symbol: 'S/',  name: 'Peruvian Sol' },
  { code: 'PHP', symbol: '₱',   name: 'Philippine Peso' },
  { code: 'PKR', symbol: '₨',   name: 'Pakistani Rupee' },
  { code: 'PLN', symbol: 'zł',  name: 'Polish Zloty' },
  { code: 'PYG', symbol: '₲',   name: 'Paraguayan Guaraní' },
  { code: 'QAR', symbol: 'QR',  name: 'Qatari Riyal' },
  { code: 'RON', symbol: 'RON', name: 'Romanian Leu' },
  { code: 'RSD', symbol: 'din', name: 'Serbian Dinar' },
  { code: 'RUB', symbol: '₽',   name: 'Russian Ruble' },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' },
  { code: 'SEK', symbol: 'kr',  name: 'Swedish Krona' },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar' },
  { code: 'THB', symbol: '฿',   name: 'Thai Baht' },
  { code: 'TND', symbol: 'DT',  name: 'Tunisian Dinar' },
  { code: 'TRY', symbol: '₺',   name: 'Turkish Lira' },
  { code: 'TTD', symbol: 'TT$', name: 'Trinidad Dollar' },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'UAH', symbol: '₴',   name: 'Ukrainian Hryvnia' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'USD', symbol: '$',   name: 'US Dollar' },
  { code: 'UYU', symbol: '$U',  name: 'Uruguayan Peso' },
  { code: 'UZS', symbol: 'сўм', name: 'Uzbekistani Som' },
  { code: 'VND', symbol: '₫',   name: 'Vietnamese Dong' },
  { code: 'XAF', symbol: 'FCFA',name: 'Central African CFA Franc' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
  { code: 'ZAR', symbol: 'R',   name: 'South African Rand' },
  { code: 'ZMW', symbol: 'ZK',  name: 'Zambian Kwacha' },
]

function CurrencyPicker({ value, onChange }) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const searchRef           = useRef(null)

  const current = CURRENCIES.find(c => c.symbol === value || c.code === value) || null

  const filtered = search.trim()
    ? CURRENCIES.filter(c => {
        const q = search.trim().toLowerCase()
        return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
      })
    : CURRENCIES

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 60)
  }, [open])

  function select(c) {
    onChange(c.symbol)
    setOpen(false)
    setSearch('')
  }

  function close() {
    setOpen(false)
    setSearch('')
  }

  return (
    <>
      <button type="button" className="currency-trigger" onClick={() => setOpen(true)}>
        <span className="currency-trigger__symbol">{value || '—'}</span>
        <span className="currency-trigger__label">
          {current ? `${current.code} — ${current.name}` : 'Select currency'}
        </span>
        <Icon.chev className="ic--sm currency-trigger__chev" />
      </button>

      {open && (
        <div className="currency-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="currency-sheet">
            <div className="currency-sheet__head">
              <span className="kicker">currency</span>
              <span className="title title--sm grow">Select currency</span>
              <button type="button" className="iconbtn iconbtn--bare" onClick={close}><Icon.x /></button>
            </div>

            <div className="currency-sheet__search">
              <Icon.search className="ic--sm" />
              <input
                ref={searchRef}
                className="input"
                type="text"
                placeholder="Search by name or code…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="currency-list">
              {filtered.length === 0 && <p className="note center" style={{ padding: '24px 0' }}>No results</p>}
              {filtered.map(c => {
                const on = value === c.symbol || value === c.code
                return (
                  <div key={c.code} className={'currency-item' + (on ? ' currency-item--on' : '')} onClick={() => select(c)}>
                    <span className="currency-item__symbol">{c.symbol}</span>
                    <span className="currency-item__body">
                      <span className="currency-item__code">{c.code}</span>
                      <span className="currency-item__name">{c.name}</span>
                    </span>
                    {on && <Icon.check className="ic--sm currency-item__check" />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CurrencyPicker
