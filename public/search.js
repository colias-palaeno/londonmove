let boroughList = [], toRender = [];

(async () => {
    await fetch('boroughs.json').then(resp => resp.json()).then(json => boroughList = json.map(b=>b[0]));
    boroughList.forEach(borough => 
        toRender.push(
            m('option', {value: borough}, borough.replace(/(\b[a-z](?!\s))/g, e=>e.toUpperCase()).replaceAll('-', ' '))
        )
    );
    m.render(document.getElementById('loc'), toRender)
})()