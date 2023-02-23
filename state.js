let width = document.getElementById("chart").getBoundingClientRect().width;
let height = document.getElementById("chart").getBoundingClientRect().height;
// draw a map of nigeria using d3
Promise.all([
  d3.json(
    "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/nigeria/nigeria-regions.json"
  ),
  d3.csv(
    "https://raw.githubusercontent.com/mcajongbah/webflow-data/main/data/election.csv"
  ),
]).then((data) => {
  const [regions, election] = data;
  drawMap(regions, width, height);

  let resizeTimer;

  window.addEventListener("resize", () => {
    width = document.getElementById("chart").getBoundingClientRect().width;
    height = document.getElementById("chart").getBoundingClientRect().height;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      d3.select("svg").remove();
      drawMap(regions, width, height);
    }, 500);
  });
});

function drawMap(regions, width, height) {
  const urlParams = new URLSearchParams(window.location.search);
  const state = urlParams.get("state");

  d3.select("#state").text(state);

  let stateData = {
    ...regions,
    objects: {
      ...regions.objects,
      NGA_adm2: {
        ...regions.objects.NGA_adm2,
        geometries: regions.objects.NGA_adm2.geometries.filter(
          (d) => d.properties.NAME_1 === state
        ),
      },
    },
  };

  // create a state map using d3
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("preserveAspectRatio", "xMidYMid meet");

  // create a projection
  const projection = d3
    .geoMercator()
    .fitSize(
      [width, height],
      topojson.feature(stateData, stateData.objects.NGA_adm2)
    );

  // create a path generator
  const pathGenerator = d3.geoPath().projection(projection);

  // create a group for the states
  svg
    .append("g")
    .attr("class", "states")
    .attr("cursor", "pointer")
    .selectAll("path")
    .data(topojson.feature(stateData, stateData.objects.NGA_adm2).features)
    .enter()
    .append("path")
    .attr("d", pathGenerator)
    .attr("fill", "#D3D3D3")
    .attr("stroke", "#36454F")
    .attr("stroke-width", 1)
    .attr("pointer-events", "all")
    .on("mousemove", onMouseMove)
    .on("mouseout", function () {
      d3.select(this).attr("opacity", 1);
      d3.select(".tooltip").style("display", "none");
    });

  function onMouseMove(e, d) {
    d3.select(this).attr("opacity", 0.8);
    d3
      .select(".tooltip")
      .style("display", "block")
      .style("padding", "5px")
      .style("left", e.pageX + 10 + "px")
      .style("top", e.pageY + 10 + "px").html(`
                <h4 class="tooltip__title">${d.properties.NAME_2}</h4>
            `);
  }
}
