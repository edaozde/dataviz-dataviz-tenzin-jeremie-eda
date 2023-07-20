//Carte
am5.ready(function () {

    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    var root = am5.Root.new("chartdiv");


    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
        am5themes_Animated.new(root)
    ]);


    // Create the map chart
    // https://www.amcharts.com/docs/v5/charts/map-chart/
    var chart = root.container.children.push(am5map.MapChart.new(root, {
        panX: "translateX",
        panY: "translateY",
        projection: am5map.geoMercator()
    }));


    // Create main polygon series for countries
    // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
    var polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"]
    }));

    polygonSeries.mapPolygons.template.setAll({
        tooltipText: "{name}",
        toggleKey: "active",
        interactive: true,
        templateField: "polygonSettings"
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
        fill: am5.color(0x677935)
      });

    polygonSeries.mapPolygons.template.states.create("hover", {
        fill: root.interfaceColors.get("primaryButtonHover")
    });

    polygonSeries.mapPolygons.template.states.create("active", {
        fill: root.interfaceColors.get("primaryButtonHover")
    });

    var previousPolygon;

    polygonSeries.mapPolygons.template.on("active", function (active, target) {
        if (previousPolygon && previousPolygon != target) {
            previousPolygon.set("active", false);
        }
        if (target.get("active")) {
            polygonSeries.zoomToDataItem(target.dataItem);
            const countrycode = target.dataItem.get("id");
            /* calling async function that is created underneath  */
                   asyncCountry(countrycode);
                   changeColor(countrycode);
        }
        else {
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
    })


    // Make stuff animate on load
    chart.appear(1000, 100);

    const changeColor = (x) => {
        polygonSeries.data.setAll([{
            id: x,
            polygonSettings: {
                fill: am5.color(0xFF3C38)
            }
        }])
    }

}); // end am5.ready()


//API 
//1 est-ce qu'il existe une station dans le pays ?

//2 fetch les stations du pays selectionné
const asyncCountry =async (countrycode) =>{
    const response = await fetch("http://de1.api.radio-browser.info/json/stations/bycountrycodeexact/"+ countrycode);
    const radioWorld = await response.json();
    console.log(radioWorld[1]);
    return radioWorld[1];
  }

//Lecteur

