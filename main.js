let filmsContent = document.querySelector('.films-content')
let headerChooseInp = document.querySelector('.header-choose-inp')

let modalContainer = document.querySelector('.modal-container')
let modalCloseBtn = document.querySelector('.modal-close-btn')

let modalSuperContent = document.querySelector('.modal-content-content')


let currentCountry
let currentCountryCode

let openAnimation = [
    {
        opacity: "0.5",
        transform: "translateY(-100%)",
    },
    {
        opacity: "1",
        transform: "translateY(0)",
    }
]

let closeAnimation = [
    {
        opacity: "1",
        transform: "translateY(0)",
    },
    {
        opacity: "0.5",
        transform: "translateY(-100%)",
    }
    
]


function getCountries() {
    fetch("http://localhost:3000/countries")
    .then(response => response.json())
    .then(countries => {
        for (const i of countries) {
            for (const country in i) {
                headerChooseInp.innerHTML += `<option id="${country}">${i[country]}</option>`
            }
        } 
    })
}

getCountries()


async function getSelectedCountry(e) {
    currentCountry = e.target.value;

    let resp = await fetch("http://localhost:3000/countries")
    let countries = await resp.json();

    for (const i of countries) {
        for (const country in i) {
            if (i[country] == currentCountry) {
                currentCountryCode = country;
                return currentCountryCode;
            }
        }
    }
}

function checkVenue(i) {
    let whereIs
    if (i._embedded.venues[0].name != undefined) {
        whereIs = i._embedded.venues[0].name
    }
    else {
        whereIs = i._embedded.venues[0].address.line1
    }
    return whereIs
}

function showCountries(currentCountryCode) {
    fetch(`https://app.ticketmaster.com/discovery/v2/events.json?countryCode=${currentCountryCode}&apikey=AxtuDA2qyWJpZhpgXKkX64bmFaWEAQD8`)
    .then(response => response.json())
    .then(concerts => {
        filmsContent.textContent = ""
        let id = 1
        
        for (const i of concerts._embedded.events) {
            let whereIs = checkVenue(i)
            filmsContent.innerHTML += `
            <div class="film" id="${id}" data-title="${i.name}">
                <img src="${i.images[0].url}" class="film-img">
                <div class="film-info">
                    <h5 class="film-title">${i.name}</h5>
                    <p class="film-date">${i.dates.start.localDate}</p>
                    <p class="film-place">
                        <img src="./img/filmSvg.svg" alt="">
                        ${whereIs}</p>
                </div>
            </div>
            `
            id++
        }
            
    })
}

headerChooseInp.addEventListener("change", async e => {
    currentCountryCode = await getSelectedCountry(e);
    showCountries(currentCountryCode)
});




filmsContent.addEventListener('click', e => {

    let clickedElement = e.target.closest('.film');
    let clickedShowTitle = clickedElement.getAttribute('data-title');

    console.log(clickedShowTitle);
    modalSuperContent.textContent = ""
    openModalWindow(clickedShowTitle)
})

function openModalWindow(clickedShowTitle) {

    modalContainer.animate(openAnimation, {duration: 300, iterations: 1})
    
    fetch(`https://app.ticketmaster.com/discovery/v2/events.json?keyword=${clickedShowTitle}&apikey=AxtuDA2qyWJpZhpgXKkX64bmFaWEAQD8`)
    .then(response => response.json())
    .then(info => {

        let price
        for (const i of info._embedded.events) {
            console.log(i);
            modalContainer.classList.remove('none')

            let whereIs = checkVenue(i)


            if (i.priceRanges === undefined) {
                price = [{ type: 'N/A', min: '-', max: '-', currency: '' }];
            } else {
                price = i.priceRanges;
            }
            
            modalSuperContent.innerHTML = `
            <img src="${i.images[1].url}" alt="" class="modal-up-image">
                <div class="modal-block-info">
                    <img src="${i.images[0].url}", alt="" class="modal-info-image">
                    <div class="modal-text-info">
                        <h1 class="modal-info-title">INFO</h1>
                        <p class="modal-info-text modal-info">Atlas Weekend is the largest music festival in Ukraine.More than 200 artists will create a proper music festival atmosphere on 10 stages</p>

                        <h1 class="modal-info-title">WHEN</h1>
                        <p class="modal-info-text modal-when">${i.dates.start.localDate}<br>${i.dates.start.localTime} (${i._embedded.venues[0].timezone})</p>

                        <h1 class="modal-info-title">WHERE</h1>
                        <p class="modal-info-text modal-where">${i.dates.start.localDate}<br>${whereIs}</p>

                        <h1 class="modal-info-title">WHO</h1>
                        <p class="modal-info-text modal-title">${i.name}</p>

                        <h1 class="modal-info-title">PRICES</h1>
                        <div class="modal-info-price-text">
                            <img src="./img/ticketSvg.svg" alt="">
                            <p class="modal-info-text2 modal-price-standart">${price[0].type} ${price[0].min}-${price[0].max} ${price[0].currency}</p>
                        </div>
                        <button class="modal-buy "><a href="${i.url}">BUY TICKETS</a></button>

                        ${price[1] ? `
                        <div class="modal-info-price-text">
                            <img src="./img/ticketSvg.svg" alt="">
                            <p class="modal-info-text2 modal-price-vip">${price[1].type} ${price[1].min}-${price[1].max} ${price[1].currency}</p>
                        </div>
                        <button class="modal-buy"><a href="${i.url}">BUY TICKETS</a></button>` : ''}
                        </div>
                        </div>
                        <button class="modal-more-info-btn">MORE FROM THIS AUTHOR</button>
                    </div>
            `;
        }
    });
}

modalCloseBtn.addEventListener('click', () => {
    let animation = modalContainer.animate(closeAnimation, {duration: 300, iterations: 1})
    animation.finished.then(() => {
        modalContainer.classList.add('none');
    })
})






// `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${}&apikey=AxtuDA2qyWJpZhpgXKkX64bmFaWEAQD8`
