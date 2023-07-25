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

  // Create main polygon series for countries
  // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
  var polygonSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, {
      geoJSON: am5geodata_worldLow,
      exclude: ["AQ"],
    })
  );

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
      asyncCountry(countrycode);
      changeColor(countrycode);
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
}); // end am5.ready()

//API
//1 est-ce qu'il existe une station dans le pays ?

const countryStationCount = async (countrycode) => {
  const response = await fetch(
    "http://de1.api.radio-browser.info/json/countrycodes" //je dois récupèrer l'objet "stationcount"
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

//2 fetch les stations du pays selectionné
const asyncCountry = async (countrycode) => {
  const response = await fetch(
    "http://de1.api.radio-browser.info/json/stations/bycountrycodeexact/" +
      countrycode
  );
  const radioWorld = await response.json();

  const randomIndexSta = Math.floor(Math.random() * radioWorld.length);

  //URL
  const randRadioUrl = radioWorld[randomIndexSta].url;
  document.getElementById("lecteur").src = randRadioUrl;

  //Radio name
  const randRadioname = radioWorld[randomIndexSta].name;
  console.log(randRadioname);
  document.getElementById("lecteur").title = randRadioname;
};
const arrayCountriesStationCount = async () => {
  const response = await fetch(
    "http://de1.api.radio-browser.info/json/countrycodes"
  );
  const countryCodesData = await response.json();

  const countriesStationCount = countryCodesData.map(
    (countryData) => countryData.name
  );
  console.log(countriesStationCount);
  return countriesStationCount;
};

arrayCountriesStationCount();
//Lecteur

//si erreur = relancer la fonction
//lecteur doit jouer automatiquement
//
