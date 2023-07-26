//check station
//URL de fetch 
const urlStationByCC = "http://all.api.radio-browser.info/json/stations/bycountrycodeexact/"
const urlStationByLanguage = "http://all.api.radio-browser.info/json/stations/bylanguage/"

//Carte
am5.ready(function () {
  // Create root element
  // https://www.amcharts.com/docs/v5/getting-started/#Root_element
  var root = am5.Root.new("chartdiv");

  // Set themes
  // https://www.amcharts.com/docs/v5/concepts/themes/
  root.setThemes([am5themes_Animated.new(root)]);

  // Create the map chart
  // https://www.amcharts.com/docs/v5/charts/map-chart/
  var chart = root.container.children.push(
    am5map.MapChart.new(root, {
      panX: "translateX",
      panY: "translateY",
      projection: am5map.geoMercator(),
    })
  );

  const arrayCountriesStationCount = async () => {
    const response = await fetch(
      "http://de1.api.radio-browser.info/json/countrycodes"
    );
    const countryCodesData = await response.json();

    const countriesStationCount = countryCodesData.map(
      (countryData) => countryData.name
    );
    console.log("in func", countriesStationCount);
    return countriesStationCount;
  };

  //arrayCountriesStationCount().then(value => { });

  var polygonSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, {
      geoJSON: am5geodata_worldLow,
      exclude: ["AQ"],
      fill: am5.color(0xd9ead3),
      stroke: am5.color(0x444444)
    })
  );

  // Create main polygon series for countries
  // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/

  polygonSeries.mapPolygons.template.setAll({
    tooltipText: "{name}",
    toggleKey: "active",
    interactive: true,
    templateField: "polygonSettings",
  });

  polygonSeries.mapPolygons.template.states.create("hover", {
    fill: am5.color(0x677935),
  });

  polygonSeries.mapPolygons.template.states.create("hover", {
    fill: root.interfaceColors.get("primaryButtonHover"),
  });

  polygonSeries.mapPolygons.template.states.create("active", {
    fill: root.interfaceColors.get("primaryButtonHover"),
  });

  var previousPolygon;

  polygonSeries.mapPolygons.template.on("active", function (active, target) {
    if (previousPolygon && previousPolygon != target) {
      previousPolygon.set("active", false);
    }
    if (target.get("active")) {
      polygonSeries.zoomToDataItem(target.dataItem);
      const countrycode = target.dataItem.get("id");

      countryStationCount(countrycode).then((stationCountData) => {
        console.log(
          `Number of stations in ${countrycode}:`,
          stationCountData.stationcount
        );
      });
      /* calling async function that is created underneath  */
      asyncCountry (urlStationByCC, countrycode).then(IdCC => changeColor(IdCC))
      cleatButtonLanguage()
    } else {
      chart.goHome();
    }
    previousPolygon = target;
  });

  // Add zoom control
  // https://www.amcharts.com/docs/v5/charts/map-chart/map-pan-zoom/#Zoom_control
  chart.set("zoomControl", am5map.ZoomControl.new(root, {}));

  // Set clicking on "water" to zoom out
  chart.chartContainer.get("background").events.on("click", function () {
    chart.goHome();
  });

  // Make stuff animate on load
  chart.appear(1000, 100);

  const changeColor = (x) => {
    polygonSeries.data.setAll([
      {
        id: x,
        polygonSettings: {
          fill: am5.color(0xff3c38),
        },
      },
    ]);
  };


//Bouton 

const allBtn = document.querySelectorAll('#topnav a')
const wrapper = document.getElementById('topnav');

  wrapper.addEventListener('click', (event) => {
    const isButton = (event.target.nodeName) === 'A';
    console.log(event.target.nodeName)
    if (!isButton) {
      return;
    }

    allBtn.forEach(bouton => bouton.className = "");
    const BtnSelected = event.target.id;

    const docBtnSelected = document.getElementById(BtnSelected)
    docBtnSelected.className = "active"

    if (BtnSelected == "BtnIT") {
      asyncCountry(urlStationByLanguage, "italian").then(IdCC => changeColor(IdCC))
    } else if (BtnSelected == "BtnEL") {
      asyncCountry(urlStationByLanguage, "greek").then(IdCC => changeColor(IdCC))
    } else if (BtnSelected == "BtnRU") {
      asyncCountry(urlStationByLanguage, "russian").then(IdCC => changeColor(IdCC))
    } else if (BtnSelected == "BtnPL") {
      asyncCountry(urlStationByLanguage, "polish").then(IdCC => changeColor(IdCC))
    } else if (BtnSelected == "BtnPT") {
      asyncCountry(urlStationByLanguage, "portuguese").then(IdCC => changeColor(IdCC))
    } else  if (BtnSelected == "BtnNL") {
      asyncCountry(urlStationByLanguage, "dutch").then(IdCC => changeColor(IdCC))
    } else {
      console.log("error")
    }
  
})


}); // end am5.ready()

//API
//1 est-ce qu'il existe une station dans le pays ?

const countryStationCount = async (countrycode) => {
  const response = await fetch(
    "http://all.api.radio-browser.info/json/countrycodes" //je dois récupèrer l'objet "stationcount"
  );
  const countryCodesData = await response.json();
  const countryData = countryCodesData.find(
    (data) => data.name === countrycode
  );
  let stationcount = 0;
  if (countryData) {
    stationcount = countryData.stationcount;

    return {
      stationcount: stationcount,
      countrycode: countrycode,
    };
  }
};

//2 fetch les stations du pays ou langue selectionné
const asyncCountry = async (url, id, data = {}) => {

  let response;

  try {
  response = await fetch( url + id, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  } catch (error) {
    console.log('There was an error', error);
  }

  const radioWorld = await response.json();


  const randomIndexSta = Math.floor(Math.random() * radioWorld.length);
  const player = document.getElementById("lecteur");

  //URL

  //Lecteur
  const radioUrlResolved = radioWorld[randomIndexSta].url_resolved;
  const radioUrl = radioWorld[randomIndexSta].url;
  const radioUrlDefault = "https://media-files.vidstack.io/audio.mp3";

  player.src = radioUrlResolved || radioUrl || radioUrlDefault;

  //Radio name
  const randRadioName = radioWorld[randomIndexSta].name;
  player.title = randRadioName;
  document.getElementById("titre-radio").innerText = randRadioName;

  //favicone
  const imgFavIcon = document.getElementById("favicon");
  const defaultFavicon =
    "https://upload.wikimedia.org/wikipedia/commons/e/e5/Mire_de_RTF_T%C3%A9l%C3%A9vision_Alger.jpg";
  const randRadioIcone = radioWorld[randomIndexSta].favicon;
  imgFavIcon.src = randRadioIcone || defaultFavicon;

  //Map 
  const randRadioCC = radioWorld[randomIndexSta].countrycode
  return randRadioCC
};


// language count

const rankLanguage = async () => {
  const response = await fetch(
    "http://all.api.radio-browser.info/json/languages"
  );

  const listLanguage = await response.json();
  console.log(listLanguage.sort((a, b) => parseFloat(b.stationcount) - parseFloat(a.stationcount)))
}

rankLanguage()
