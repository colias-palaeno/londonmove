const boroughsElem = document.getElementById('boroughsElem'),
formatPrice = x => '£'+x.toLocaleString(),
now = new Date(),
getDate = offset => `${now.getFullYear()}-${(now.getMonth()+1-offset+'').padStart(2, "0")}-01`,
cacheCheckingFunc = (val, func) => {
    const valCache =  Cookies.get(val + 'Cache')
    if (valCache == null) 
        func();
    else {
        m.render(boroughsElem, 
            JSON.parse(valCache).map(el => m('span', 
                [
                    `${el[0].replace(/(\b[a-z](?!\s))/g, el=>el.toUpperCase()).replaceAll('-', ' ')}: `,
                    m('b', formatPrice(el[1])), 
                    m('img', {src: `arrow${el[2]}.png`}),  
                    m('br')
                ]
            ))
        )
    }
},
landRegURL = 
`https://landregistry.data.gov.uk/app/ukhpi/download/new.json?from=${getDate(3)}&to=${getDate(2)}&location=http://landregistry.data.gov.uk/id/region/`
// that was a mouthful! 

let boroughsSorted = [], boroughList;

(async () => {
    await fetch('boroughs.json').then(resp => resp.json()).then(json => boroughList = json.map(b=>b[0]));

    cacheCheckingFunc('prices', () => 
    {
        boroughList.forEach(borough => 
        {
            fetch(landRegURL + borough)
                .catch(err => console.error(err))
                .then(resp => resp.json())
                    .then(json => 
                    {
                        let pricesArr = [json.items[0]['ukhpi:averagePrice'][0], json.items[1]['ukhpi:averagePrice'][0]]
                        boroughsSorted.push([borough, pricesArr[1], Number(pricesArr[0] < pricesArr[1])])
                        if (boroughList.indexOf(borough) == 31) 
                            fetchingCompletedCallback('prices')
                    });
        });
    })

    function fetchingCompletedCallback(type) 
    {
        boroughsSorted.sort((a,b)=>a[1]-b[1])
        Cookies.set(type + 'Cache', JSON.stringify(boroughsSorted), {expires: 31})
        boroughsSorted = boroughsSorted.map(el => 
            m('span', 
                [
                    `${el[0].replace(/(\b[a-z](?!\s))/g, el=>el.toUpperCase()).replaceAll('-', ' ')}: `,
                    m('b', formatPrice(el[1])),
                    m('img', {src: `arrow${el[2]}.png`}),  
                    m('br')
                ]
            )
        )
            
        m.render(boroughsElem, boroughsSorted)
    };

})()