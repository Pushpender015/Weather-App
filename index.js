const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector(".form-container");
const loadingScreen = document.querySelector(".loading-container")
const userInfoContainer = document.querySelector(".user-info-container")

// for error
const errorHandle = document.querySelector("[data-error]");
const retryButton = document.querySelector("[data-apierrorbtn]");

// initially variables need ???

let currentTab = userTab;
const API_KEY = "43c64730b1d31bbcff6f2a21d5a644d2";
currentTab.classList.add("current-tab");         // dynamically add "class"

getFromSessionStorage();    /// jab bhi hum website open krte hai to syd phele se lat & lon pde ho that why
                            // call this method agr honge to dikha dega or nhi honge to fetch kr lega

// switching the tab's

function switchTab(clickedTab) {
    
    // if current tab is not click tab --> then switch tab
    if(clickedTab != currentTab) {                    // FOR EX:- if currentTab == userTab and clickedTab == searchTab
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;                       // here , currentTab become userTab
        currentTab.classList.add("current-tab");

        // i want to know where I stand
        if(!searchForm.classList.contains("active")) {   
            // is "searchForm cantainer" is invisible , if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }

        else {
            // main pehle search wale tab pr tha, ab "your weather" tab "visible" karna hai
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            
            // I am come in "your weather tab" , then weather bhi display krna padega , 
            // so lets check local storage first for "coords" , if we haved saved them there.
            getFromSessionStorage();

        }
    }
}

userTab.addEventListener("click" , () => {
    // pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click" , () => {
    // pass clicked tab as input parameter
    switchTab(searchTab);
});


// check if coordinates are already present in session storage
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");    // Session storage is a way to store data temporarily in the browser.
    
    if(!localCoordinates) {
        // agar local coordinates nahi mile "session storage me" (toh location pr ho vo location find out kro 
        // & or jo "lat and lon" mil jaye unko store kr dena sessionStorage me )
        grantAccessContainer.classList.add("active");
    }
    else {       // agar coords phele se pde hai to "FETCH API" call kr dia
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

// API Call ---> for fetching coords
async function fetchUserWeatherInfo(coordinates) {
    const {lat , lon} = coordinates;
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    // make lodder visible
    loadingScreen.classList.add("active");

    // API call
    try {
        // fetching data 
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        const data = await response.json();

        // data fetched completely (remove loading screen & add user info container)
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);                 // after fetching complete data "rendering on the screen"

    } catch (error) {
        // HW
    }
}


function renderWeatherInfo(weatherInfo) {
    // firstly , we have to fetch the elements

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloud]");

    // fetch values from weatherINFO object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} mph`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}

// getLocation
function getLocation() {
    console.log("Grant Access button clicked.");
    if(navigator.geolocation) {            // kya apke browser me geolocation supported hai ya nhi
        navigator.geolocation.getCurrentPosition(showPosition);     // agar supproted hai , fir request the current position  
    }
    else {
        console.log("no geoLocation support available ");
    }
}

function showPosition(position) {        // parameter("position") is an object contain the geographical coordinates and other information about location
    
    const userCoordinates = {
        lat : position.coords.latitude,    // access the "latitude property" "coords object" within the "position object"
        lon : position.coords.longitude
    }

    // It stores the userCoordinates object in session storage after converting it to a string using JSON.stringify.
    sessionStorage.setItem("user-coordinates" , JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

    // access grant access button
const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);


    // access search Input section
const searchInput = document.querySelector("[data-searchForm]");

searchForm.addEventListener("submit", (e) => {        // The event listener is triggered when the form is submitted. 
                                                      // Object "e" contains information about the event that occurred.
    
    e.preventDefault();            // why ?????

    let cityName = searchInput.querySelector("input").value;

    if(cityName === "")   return;
    else      fetchSearchWeatherInfo(cityName);
})


    // fetching data of weather from "city name"
async function fetchSearchWeatherInfo(city) {
    errorHandle.classList.remove("active");
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        else {
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
        }

    } catch (error) {
        //HW
        displayErrorImage(error);
    }
}


// handling error "when error occur during fetch data of weather "

function displayErrorImage(error) {
        userInfoContainer.classList.remove("active");
        loadingScreen.classList.remove("active");
        errorHandle.classList.add("active");
}

retryButton.addEventListener("click" , () => {
    //remove error conatianer
    console.log("Retry button clicked");
    errorHandle.classList.remove("active");
});