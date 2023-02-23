let width = document.getElementById("chart").getBoundingClientRect().width;
let height = document.getElementById("chart").getBoundingClientRect().height;
// draw a map of nigeria using d3
Promise.all([
  d3.json(
    "https://raw.githubusercontent.com/mcajongbah/webflow-data/main/data/nigeria-states.json"
  ),
  d3.csv(
    "https://raw.githubusercontent.com/mcajongbah/webflow-data/main/data/election.csv"
  ),
]).then((data) => {
  const [states, election] = data;
  drawMap(states, election, width, height);

  let resizeTimer;

  window.addEventListener("resize", () => {
    width = document.getElementById("chart").getBoundingClientRect().width;
    height = document.getElementById("chart").getBoundingClientRect().height;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      d3.select("svg").remove();
      drawMap(states, election, width, height);
    }, 500);
  });
});

function drawMap(states, election, width, height) {
  election.forEach((d) => {
    d.APC = +d.APC;
    d.PDP = +d.PDP;
    d.PCP = +d.PCP;
    d.ADC = +d.ADC;
    d.APGA = +d.APGA;
  });

  const candidates = {
    APC: "Muhammadu Buhari (APC)",
    PDP: "Atiku Abubakar (PDP)",
    PCP: "Felix Nicolas (PCP)",
    ADC: "Obadiah Mailafia (ADC)",
    APGA: "Gbor John Wilson Terwase (APGA)",
  };
  const percentage = [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90];

  // create a color scale
  const PDPColourScale = d3
    .scaleOrdinal()
    .domain([40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90])
    .range([
      "#A3FFA6",
      "#70FF74",
      "#4FFF42",
      "#4FFF0C",
      "#41D605",
      "#2FA302",
      "#258602",
      "#1B6902",
      "#135202",
      "#0A3802",
      "#042002",
    ]);

  const APCColourScale = d3
    .scaleLinear()
    .domain([40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90])
    .range([
      "#B4D6F3",
      "#87BEEB",
      "#5FAAE2",
      "#3290DD",
      "#246CB0",
      "#1C5A90",
      "#164979",
      "#113F64",
      "#0D314F",
      "#092539",
      "#041525",
    ]);

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
      topojson.feature(states, states.objects.NGA_adm1)
    );

  // create a path generator
  const pathGenerator = d3.geoPath().projection(projection);

  // create a group for the states
  svg
    .append("g")
    .attr("class", "states")
    .attr("cursor", "pointer")
    .selectAll("path")
    .data(topojson.feature(states, states.objects.NGA_adm1).features)
    .enter()
    .append("path")
    .attr("d", pathGenerator)
    .attr("fill", function (d) {
      const state = election.find((e) => e.State === d.properties.NAME_1);

      const winner = Object.keys(state).reduce((a, b) =>
        state[a] > state[b] ? a : b
      );
      // return winning percentage
      const percentage = (
        (state[winner] /
          Object.values(state)
            .splice(1)
            .reduce((a, b) => a + b)) *
        100
      ).toFixed(2);

      return winner === "APC"
        ? APCColourScale(percentage)
        : PDPColourScale(percentage);
    })
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .attr("pointer-events", "all")
    .on("mousemove", onMouseMove)
    .on("mouseout", function () {
      d3.select(this).attr("opacity", 1);
      d3.select(".tooltip").style("display", "none");
    })
    .on("click", function (event, d) {
      const state = d.properties.NAME_1;

      window.location.href = `state.html?state=${state}`;
    });

  function onMouseMove(e, d) {
    d3.select(this).attr("opacity", 0.8);
    const tooltip = d3.select(".tooltip");
    const state = election.find((e) => e.State === d.properties.NAME_1);
    const winner = Object.keys(state).reduce((a, b) =>
      state[a] > state[b] ? a : b
    );
    tooltip
      .style("left", width > 640 ? e.pageX + 10 + "px" : "0px")
      .style("top", width > 640 ? e.pageY + 10 + "px" : "0px")
      .style("display", "block")
      .style("padding", "5px").html(`
        <div>
            <h2>${d.properties.NAME_1}</h2>
            <button>X</button>
        </div>
        <table>
            <thead>
            <tr>
                <th>Candidate</th>
                <th>Votes</th>
                <th>Percentage</th>
            </tr>
            </thead>
            <tbody>
            ${Object.keys(state)
              .splice(1)
              .map(
                (key) =>
                  `<tr style='background-color: ${
                    key === winner ? "#ccc" : "inherit"
                  }'>
                    <td class='candidate'>${candidates[key]}</td>
                    <td>${state[key]}</td>
                    <td>${(
                      (state[key] /
                        Object.values(state)
                          .splice(1)
                          .reduce((a, b) => a + b)) *
                      100
                    ).toFixed(2)}%</td>
                    </tr>`
              )
              .join("")}
            </tbody>
        </table>

        <div class='state-link'>
          <a href='state.html?state=${d.properties.NAME_1}'>View State</a>
        </div>
        `);
  }

  d3.select(".tooltip button").on("click", function () {
    d3.select(".tooltip").style("display", "none");
  });

  // append state names
  svg
    .append("g")
    .attr("class", "state-names")
    .selectAll("text")
    .data(topojson.feature(states, states.objects.NGA_adm1).features)
    .enter()
    .append("text")
    .attr("x", (d) => pathGenerator.centroid(d)[0])
    .attr("y", (d) => pathGenerator.centroid(d)[1])
    .attr("text-anchor", "middle")
    .attr("pointer-events", "none")
    .attr("font-size", 10)
    .attr("font-weight", "bold")
    .attr("fill", "white")
    .text((d) =>
      d.properties.NAME_1 === "Federal Capital Territory"
        ? "FCT"
        : d.properties.NAME_1
    );

  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 140}, ${height - 50})`);

  // legend for APC
  legend
    .append("g")
    .attr("class", "apc-legend")
    .attr("transform", "translate(20, 20)")
    .selectAll("rect")
    .data(percentage)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * 10)
    .attr("y", 0)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", (d) => APCColourScale(d));

  // legend for PDP
  legend
    .append("g")
    .attr("class", "pdp-legend")
    .attr("transform", "translate(20, 35)")
    .selectAll("rect")
    .data(percentage)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * 10)
    .attr("y", 0)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", (d) => PDPColourScale(d));

  // legend text
  legend
    .append("g")
    .attr("transform", "translate(20, 0)")
    .selectAll("text")
    .data(percentage)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * 10)
    .attr("y", 0)
    .attr("dx", 4)
    .attr("dy", 15)
    .attr("text-anchor", "middle")
    .attr("font-size", 6)
    .attr("fill", "black")
    .text((d) => d);

  d3.selectAll(".apc-legend")
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", -10)
    .attr("dy", 8)
    .attr("text-anchor", "end")
    .attr("font-size", 10)
    .attr("fill", "black")
    .text("APC");

  d3.selectAll(".pdp-legend")
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", -10)
    .attr("dy", 8)
    .attr("text-anchor", "end")
    .attr("font-size", 10)
    .attr("fill", "black")
    .text("PDP");
}
