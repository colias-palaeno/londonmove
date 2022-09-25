const borough = this.location.pathname.slice(8),
boroughCookie = Cookies.get(borough),
results = document.getElementById('results'),
now = new Date(),
getDate = offset => {
    if (now.getMonth()-offset < 0) offset -= 12
    return `${now.getFullYear()}-${(now.getMonth()+1-offset+'').padStart(2, "0")}-01`
},
landRegURL = `https://landregistry.data.gov.uk/app/ukhpi/download/new.json?from=${getDate(3)}&to=${getDate(2)}&location=http://landregistry.data.gov.uk/id/region/`,
getCrimeDataURL = (lat, lng) => `https://data.police.uk/api/crimes-street/all-crime?date=${now.getFullYear()-1}-${now.getMonth()+1}&lat=${lat}&lng=${lng}`

document.querySelector('heading').innerHTML += ` - ${borough.replaceAll('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}` 

if (boroughCookie != null) 
{ // checks if there's a cookie with info on this EXACT borough
    const parsedBoroughCookie = JSON.parse(boroughCookie)
    m.render(results, m('span', [
        'Average Property Prices: ',
        m('b', parsedBoroughCookie[0]),
        m('img', {src: `../arrow${parsedBoroughCookie[1]}.png`}), m('br'),
        'Crime Count: ',
        m('b', parsedBoroughCookie[2])
    ]))
} 

else 
{
    const pricesCache = Cookies.get('pricesCache')
    let dataToRender = [], boroughCoords;

    (async () => {
        await fetch('../boroughs.json')
        .then(resp => resp.json())
        .then(arr => 
            boroughCoords = arr[arr.findIndex(b => b.includes(borough))].slice(1)
        );

        await fetch(getCrimeDataURL(...boroughCoords))
        .then(resp => resp.json())
        .then(json => dataToRender.push(json.length.toLocaleString()))

        if (pricesCache != null) 
        { // checks if there's a cookie with prices from the homepage (info on all boroughs)
            const indexOfBorough = JSON.parse(pricesCache).findIndex(el => el.includes(borough)),
            boroughInPricesCache = JSON.parse(pricesCache)[indexOfBorough]
            dataToRender.unshift(`(No. ${indexOfBorough+1})`)
            m.render(results, 
                m('span', [
                    'Average Property Prices: ',
                    m('b', '£'+boroughInPricesCache[1].toLocaleString()),
                    m('img', {src: `../arrow${boroughInPricesCache[2]}.png`}),
                    dataToRender[0], m('br'),
                    'Crime Count: ',
                    m('b', dataToRender[1])
                ])
            )
        } 
        
        else 
        {
            fetch(landRegURL + borough)
                .catch(e => m.render(results, [m(`div', 'Error: ${e}.`), m('br'), m('Please try refreshing the page.')]))
                .then(resp => resp.json())
                    .then(json => {
                        const prices = [
                            json.items[0]['ukhpi:averagePrice'][0], json.items[1]['ukhpi:averagePrice'][0]
                        ], higherPrice = (prices[0] < prices[1]) ? 1 : 0
                        dataToRender.unshift('£'+prices[0].toLocaleString(), higherPrice)

                        Cookies.set(borough, JSON.stringify(dataToRender), {expires: 31})
                        m.render(results, [
                            m('span', [
                                'Average Property Prices: ',
                                m('b', dataToRender[0]),
                                m('img', {src: `../arrow${dataToRender[1]}.png`}), m('br'),
                                'Crime Count: ',
                                m('b', dataToRender[2])
                            ])
                        ])
                    })
        }
    })()
}